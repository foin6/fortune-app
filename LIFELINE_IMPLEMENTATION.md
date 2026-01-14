# 人生 K 线服务实现总结

## ✅ 已完成的工作

### 1. 数据模型 (`schemas.py`)

创建了与前端 Recharts 兼容的数据模型：

- **`LifeCurveResponse`**: 主响应模型
  - `user_profile`: 用户信息（name, bazi）
  - `chart_data`: 0-100岁的数据列表（101个数据点）
  - `summary`: 总结信息（current_score, trend, peaks, valleys, advice）

- **`ChartDataPoint`**: 图表数据点
  - `age`, `year`, `score`, `is_peak`, `is_valley`
  - `gan_zhi` (流年干支), `da_yun` (大运干支)
  - `details`, `label`

- **`PeakValley`**: 高峰/低谷节点
  - `age`, `year`, `reason`, `score`

### 2. 核心服务 (`services/lifeline.py`)

实现了 `LifeLineService` 类，采用混合模式架构：

#### Step A: 硬计算 (The "Left Brain")
- ✅ 使用 `lunar_python` 计算八字原局（四柱）
- ✅ 计算 0-100 岁每十年的大运
- ✅ 生成 0-100 岁的时间轴（每年一个数据点）
- ✅ 计算每年的流年干支

#### Step B: 构造 Prompt
- ✅ 将八字原局和大运列表格式化
- ✅ 构造详细的 System Prompt
- ✅ 要求 AI 返回严格的 JSON 格式

#### Step C: 调用 DeepSeek API
- ✅ 使用 `httpx` 异步调用 DeepSeek API
- ✅ 解析 JSON 响应（支持 markdown 代码块）
- ✅ 错误处理和降级策略（API 失败时使用默认数据）

#### Step D: 数据融合 (Merge)
- ✅ 将 AI 返回的 scores、peaks、valleys 与时间轴合并
- ✅ 自动生成标签（大吉、吉、平、小凶、凶）
- ✅ 计算趋势（上升、下降、平稳）
- ✅ 格式化 peaks 和 valleys

### 3. 项目结构

```
fortune_app/
├── schemas.py                    # 数据模型
├── services/
│   ├── __init__.py              # 模块初始化
│   ├── lifeline.py             # 核心服务
│   └── README.md               # 使用文档
└── LIFELINE_IMPLEMENTATION.md  # 本文档
```

## 🔧 技术细节

### 八字计算
- 使用 `FortuneCalculator.calculate_true_solar_time()` 计算真太阳时
- 使用 `FortuneCalculator.get_si_zhu()` 获取四柱
- 使用 `FortuneCalculator.calculate_da_yun()` 计算大运

### 流年计算
- 使用 `lunar_python.Solar.fromYmd()` 和 `getLunar()` 获取农历
- 使用 `getYearGan()` 和 `getYearZhi()` 获取年干支

### 大运匹配
- 每 10 年一个大运
- 超过最后一个大运的年龄使用最后一个大运

### DeepSeek API 调用
- 模型: `deepseek-chat`
- 超时: 60 秒
- 温度: 0.7
- 最大 tokens: 2000

## 📝 使用方法

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

## ✅ 测试验证

- ✅ 数据模型导入成功
- ✅ 服务类导入成功
- ✅ 时间轴计算功能正常
- ✅ 八字和大运计算正确
- ✅ 流年干支计算正确
- ✅ 大运匹配逻辑正确

## 🚀 下一步

1. **集成到 FastAPI**: 在 `main.py` 的 `/api/generate-kline` 接口中使用 `lifeline_service`
2. **配置 API Key**: 确保 `.env` 文件中配置了 `DEEPSEEK_API_KEY`
3. **前端对接**: 确保前端 `KLineChart.jsx` 能够正确解析返回的数据格式
4. **错误处理**: 根据实际使用情况优化错误处理和降级策略

## 📚 相关文档

- `services/README.md`: 详细的使用文档
- `schemas.py`: 数据模型定义
- `services/lifeline.py`: 核心服务实现
