# 人生 K 线服务 (LifeLineService)

## 概述

`LifeLineService` 是一个混合模式的服务，结合了：
- **lunar_python**: 精准的八字和大运计算（硬计算）
- **DeepSeek API**: 大模型推理生成运势曲线（AI 推理）

## 架构设计

### Step A: 硬计算 (The "Left Brain")
使用 `lunar_python` 库：
1. 根据出生日期计算用户的"八字"（四柱）
2. 计算 0-100 岁每十年的大运
3. 生成 0-100 岁的时间轴列表，包含：`age`, `year`, `gan_zhi` (流年干支), `da_yun` (大运)

### Step B: 构造 Prompt
将 Step A 算出的八字原局和大运列表放入 System Prompt，要求 AI 返回 JSON 格式的运势数据。

### Step C: 调用 DeepSeek API
使用 `httpx` 异步调用 DeepSeek API，获取 AI 生成的运势分数、高峰、低谷等信息。

### Step D: 数据融合 (Merge)
将 AI 返回的数据与时间轴合并，生成最终的前端可用的图表数据。

## 使用方法

### 1. 配置环境变量

在 `.env` 文件中设置：

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_BASE_URL=https://api.deepseek.com/v1
```

### 2. 在 FastAPI 中使用

```python
from services.lifeline import lifeline_service

@app.post("/api/generate-kline")
async def generate_kline(request: KLineGenerateRequest):
    result = await lifeline_service.generate_life_curve(
        birth_date=request.birth_date,
        birth_time=request.birth_time,
        lng=request.lng,
        lat=request.lat,
        gender=request.gender,
        name=request.name
    )
    return result.dict()
```

### 3. 返回数据格式

返回 `LifeCurveResponse` 对象，包含：

```python
{
    "user_profile": {
        "name": "张三",
        "bazi": ["庚午", "辛巳", "庚辰", "癸未"]
    },
    "chart_data": [
        {
            "age": 0,
            "year": 2000,
            "score": 60,
            "is_peak": False,
            "is_valley": False,
            "gan_zhi": "庚辰",
            "da_yun": "壬午",
            "details": "平稳发展",
            "label": "平"
        },
        # ... 共 101 个数据点（0-100岁）
    ],
    "summary": {
        "current_score": 65,
        "trend": "上升",
        "peaks": [
            {"age": 26, "year": 2026, "reason": "官印相生", "score": 85}
        ],
        "valleys": [
            {"age": 30, "year": 2030, "reason": "岁运并临", "score": 45}
        ],
        "advice": "建议在高峰年份把握机会，低谷年份谨慎行事"
    }
}
```

## 数据模型

### ChartDataPoint
- `age`: 年龄（0-100）
- `year`: 年份
- `score`: 运势分数（0-100）
- `is_peak`: 是否为高峰
- `is_valley`: 是否为低谷
- `gan_zhi`: 流年干支
- `da_yun`: 大运干支
- `details`: 详细说明
- `label`: 标签（如"吉"、"凶"）

### PeakValley
- `age`: 年龄
- `year`: 年份
- `reason`: 原因说明
- `score`: 该年份的分数

## 注意事项

1. **API Key 配置**: 必须配置 `DEEPSEEK_API_KEY`，否则会使用默认数据（所有年份 60 分）
2. **数据精度**: 八字和大运计算使用 `lunar_python`，确保历法转换的准确性
3. **流年计算**: 流年干支使用该年的农历年干支
4. **大运匹配**: 大运每 10 年一换，超过最后一个大运的年龄使用最后一个大运

## 错误处理

如果 DeepSeek API 调用失败，服务会：
1. 打印错误日志
2. 使用默认数据（所有年份 60 分）
3. 返回可用的响应（不会抛出异常）

这样可以确保即使 API 调用失败，前端也能正常显示图表（虽然数据是默认值）。
