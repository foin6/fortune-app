# K 线图数据格式说明

## 后端返回数据结构

```json
{
  "success": true,
  "data": {
    "chart_data": {
      "points": [
        {
          "age": 0,
          "year": 2000,
          "gan_zhi": "庚辰",
          "da_yun": "甲申",
          "score": 65,
          "is_peak": false,
          "is_valley": false
        },
        ... // 共101个数据点（0-100岁）
      ],
      "peaks": [
        {
          "age": 13,
          "score": 85,
          "reason": "官印相生，事业高峰"
        },
        ... // 3-5个高峰
      ],
      "valleys": [
        {
          "age": 10,
          "score": 31,
          "reason": "岁运并临，需谨慎"
        },
        ... // 3-5个低谷
      ],
      "current_age": 26,
      "current_fortune": {
        "score": 69,
        "label": "吉"
      },
      "trend_5years": {
        "direction": "下降",
        "value": -17.0,
        "description": "下降（17分）"
      },
      "next_peak": {
        "age": 53,
        "years_left": 27,
        "score": 73,
        "reason": "财星当令，财运亨通"
      },
      "next_valley": {
        "age": 30,
        "years_left": 4,
        "score": 32,
        "reason": "岁运并临，需谨慎"
      },
      "stage_analysis": [
        {
          "name": "童年",
          "age_range": "0-12岁",
          "avg_score": 54.0,
          "is_current": false
        },
        {
          "name": "青年",
          "age_range": "13-30岁",
          "avg_score": 65.0,
          "is_current": true
        },
        {
          "name": "壮年",
          "age_range": "31-50岁",
          "avg_score": 50.0,
          "is_current": false
        },
        {
          "name": "中年",
          "age_range": "51-65岁",
          "avg_score": 49.0,
          "is_current": false
        },
        {
          "name": "老年",
          "age_range": "66-100岁",
          "avg_score": 42.0,
          "is_current": false
        }
      ],
      "current_year_detail": {
        "age": 26,
        "year": 2026,
        "gan_zhi": "丙午",
        "da_yun": "癸未运",
        "score": 69,
        "label": "吉",
        "wealth": "财运稳健，升职加薪",
        "interpersonal": "贵人提携",
        "relationship": "感情正式稳定",
        "health": "防止过劳",
        "suitable": "晋升加薪",
        "avoid": "背后议论"
      }
    },
    "analysis_text": "整体大运总结，约200字...",
    "bazi_report": {
      // 完整的八字排盘信息
      "chart": {...},
      "gods": {...},
      "da_yun": [...]
    }
  }
}
```

## 数据字段说明

### chart_data.points
- **类型**: Array[Object]
- **长度**: 101个（0-100岁）
- **字段**:
  - `age`: 年龄（0-100）
  - `year`: 年份
  - `gan_zhi`: 流年干支
  - `da_yun`: 大运
  - `score`: 运势分数（0-100）
  - `is_peak`: 是否为高峰
  - `is_valley`: 是否为低谷

### chart_data.current_fortune
- **类型**: Object
- **字段**:
  - `score`: 当前运势分数
  - `label`: 运势标签（"吉"/"平"/"凶"）

### chart_data.trend_5years
- **类型**: Object
- **字段**:
  - `direction`: 趋势方向（"上升"/"下降"/"平稳"）
  - `value`: 趋势变化值（正数表示上升，负数表示下降）
  - `description`: 趋势描述文本

### chart_data.next_peak
- **类型**: Object | null
- **字段**:
  - `age`: 下个高峰年龄
  - `years_left`: 还有多少年
  - `score`: 高峰分数
  - `reason`: 高峰原因

### chart_data.next_valley
- **类型**: Object | null
- **字段**:
  - `age`: 需注意时期年龄
  - `years_left`: 还有多少年
  - `score`: 低谷分数
  - `reason`: 低谷原因

### chart_data.stage_analysis
- **类型**: Array[Object]
- **长度**: 5个（童年、青年、壮年、中年、老年）
- **字段**:
  - `name`: 阶段名称
  - `age_range`: 年龄范围
  - `avg_score`: 平均分数
  - `is_current`: 是否当前阶段

### chart_data.current_year_detail
- **类型**: Object
- **字段**:
  - `age`: 年龄
  - `year`: 年份
  - `gan_zhi`: 流年干支
  - `da_yun`: 大运
  - `score`: 分数
  - `label`: 标签（"吉"/"平"/"凶"）
  - `wealth`: 财运描述
  - `interpersonal`: 人际关系描述
  - `relationship`: 感情描述
  - `health`: 健康描述
  - `suitable`: 宜做事项
  - `avoid`: 忌做事项

## 前端使用示例

```javascript
const klineData = result.data; // generateKLineChart 已提取 data

// 访问数据
const chartData = klineData.chart_data;
const currentFortune = chartData.current_fortune;
const trend = chartData.trend_5years;
const nextPeak = chartData.next_peak;
const nextValley = chartData.next_valley;
const stages = chartData.stage_analysis;
const currentDetail = chartData.current_year_detail;
```

## 注意事项

1. `generateKLineChart` 函数已经提取了 `result.data`，所以前端接收的 `klineData` 直接包含 `chart_data` 和 `analysis_text`
2. 如果 LLM 调用失败，会使用默认数据，但数据结构保持一致
3. `next_peak` 和 `next_valley` 可能为 `null`（如果没有找到下一个高峰/低谷）
4. `current_year_detail` 中的详细描述（wealth, interpersonal 等）目前是默认值，后续可通过 LLM 生成更详细的分析
