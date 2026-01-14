# 人生 K 线接口文档

## 接口信息

- **URL**: `POST /api/divination/life-line`
- **描述**: 生成人生 K 线数据（0-100岁的运势曲线）

## 请求参数

### 请求体 (JSON)

```json
{
  "year": 2000,           // 出生年份 (1900-2100)
  "month": 1,            // 出生月份 (1-12)
  "day": 1,              // 出生日期 (1-31)
  "hour": 12,            // 出生小时 (0-23)
  "minute": 0,           // 出生分钟 (0-59)，可选，默认为 0
  "lng": 116.3974,       // 经度（必填）
  "lat": 39.9093,        // 纬度（必填）
  "gender": "male",      // 性别：male/female 或 男/女
  "name": "张三"          // 姓名，可选，默认为 "用户"
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| year | int | 是 | 出生年份，范围 1900-2100 |
| month | int | 是 | 出生月份，范围 1-12 |
| day | int | 是 | 出生日期，范围 1-31，会根据年月验证有效性 |
| hour | int | 是 | 出生小时，范围 0-23 |
| minute | int | 否 | 出生分钟，范围 0-59，默认为 0 |
| lng | float | 是 | 经度（用于计算真太阳时） |
| lat | float | 是 | 纬度（用于计算真太阳时） |
| gender | string | 是 | 性别：`male`/`female` 或 `男`/`女` |
| name | string | 否 | 姓名，默认为 "用户" |

## 响应数据

### 成功响应 (200)

```json
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
      "is_peak": false,
      "is_valley": false,
      "gan_zhi": "庚辰",
      "da_yun": "壬午",
      "details": "平稳发展",
      "label": "平"
    },
    // ... 共 101 个数据点（0-100岁）
  ],
  "summary": {
    "current_score": 65,
    "trend": "上升",
    "peaks": [
      {
        "age": 26,
        "year": 2026,
        "reason": "官印相生",
        "score": 85
      }
    ],
    "valleys": [
      {
        "age": 30,
        "year": 2030,
        "reason": "岁运并临",
        "score": 45
      }
    ],
    "advice": "建议在高峰年份把握机会，低谷年份谨慎行事"
  }
}
```

### 响应字段说明

#### user_profile
- `name`: 用户姓名
- `bazi`: 八字四柱（年柱、月柱、日柱、时柱）

#### chart_data (数组，101个元素)
每个元素包含：
- `age`: 年龄（0-100）
- `year`: 年份
- `score`: 运势分数（0-100）
- `is_peak`: 是否为高峰
- `is_valley`: 是否为低谷
- `gan_zhi`: 流年干支
- `da_yun`: 大运干支
- `details`: 详细说明
- `label`: 标签（大吉、吉、平、小凶、凶）

#### summary
- `current_score`: 当前分数
- `trend`: 趋势（上升、下降、平稳）
- `peaks`: 高峰列表（3-5个）
- `valleys`: 低谷列表（3-5个）
- `advice`: 建议

## 错误响应

### 400 Bad Request
```json
{
  "detail": "数据验证失败: 日期无效: 2000-2-30"
}
```

### 500 Internal Server Error
```json
{
  "detail": "生成人生 K 线失败: ..."
}
```

## 异常处理

接口实现了完善的异常处理机制：

1. **数据验证失败**: 返回 400 错误，包含具体的验证错误信息
2. **AI 调用失败**: 使用默认数据（所有年份 score=60）填充，确保返回 101 条数据
3. **数据点不足**: 自动使用默认值填充到 101 个数据点
4. **分数超出范围**: 自动修正为 60 分

**重要**: 接口保证永远返回合法的 101 条数据，防止前端白屏。

## 使用示例

### cURL

```bash
curl -X POST "http://localhost:8000/api/divination/life-line" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2000,
    "month": 1,
    "day": 1,
    "hour": 12,
    "minute": 0,
    "lng": 116.3974,
    "lat": 39.9093,
    "gender": "male",
    "name": "张三"
  }'
```

### Python

```python
import requests

url = "http://localhost:8000/api/divination/life-line"
data = {
    "year": 2000,
    "month": 1,
    "day": 1,
    "hour": 12,
    "minute": 0,
    "lng": 116.3974,
    "lat": 39.9093,
    "gender": "male",
    "name": "张三"
}

response = requests.post(url, json=data)
result = response.json()
print(result)
```

### JavaScript (Fetch)

```javascript
fetch('http://localhost:8000/api/divination/life-line', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    year: 2000,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    lng: 116.3974,
    lat: 39.9093,
    gender: 'male',
    name: '张三'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## 注意事项

1. **日期验证**: 系统会自动验证日期的有效性（如 2 月 30 日会被拒绝）
2. **性别格式**: 支持 `male`/`female` 或 `男`/`女`，不区分大小写
3. **数据保证**: 即使 AI 调用失败，接口也会返回 101 个数据点（默认分数为 60）
4. **真太阳时**: 系统会根据经纬度自动计算真太阳时，确保八字计算的准确性
