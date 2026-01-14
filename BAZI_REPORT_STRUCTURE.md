# BaziReport 数据结构文档

## 概述

BaziReport 是深度八字分析报告的完整数据结构，包含四柱详情、五行能量分析、用神分析等核心数据。

## 数据结构

```json
{
  "chart": {
    "pillars": [
      {
        "name": "年柱",
        "gan": "庚",
        "zhi": "午",
        "gan_zhi": "庚午",
        "cang_gan": [
          {"gan": "丁", "score": 5},
          {"gan": "己", "score": 3}
        ],
        "na_yin": "土",
        "zi_zuo": "",
        "gan_wuxing": "金",
        "zhi_wuxing": "火"
      },
      // ... 月柱、日柱、时柱
    ],
    "si_zhu": {
      "year": "庚午",
      "month": "辛巳",
      "day": "庚辰",
      "hour": "癸未"
    },
    "shi_shen": {
      "year_shi_shen": "比肩",
      "month_shi_shen": "偏印",
      "day_shi_shen": "日主",
      "hour_shi_shen": "七杀"
    },
    "day_gan": "庚",
    "day_zhi": "辰"
  },
  "five_elements": {
    "scores": {
      "木": 4,
      "火": 23,
      "土": 26,
      "金": 16,
      "水": 6
    },
    "percentages": {
      "木": 5.08,
      "火": 29.11,
      "土": 32.91,
      "金": 20.25,
      "水": 7.59
    },
    "strongest": "土",
    "weakest": "木",
    "missing": "五行齐全",
    "details": [
      "年柱庚：金+5",
      "年柱午：火+5",
      "年柱午藏干丁：火+5",
      // ... 更多详情
    ]
  },
  "gods": {
    "useful_god": "水",
    "useful_gods": ["水", "金"],
    "taboo_god": "火",
    "taboo_gods": ["火", "土", "木"],
    "day_gan": "庚",
    "day_wuxing": "金",
    "is_strong": false,
    "tong_dang_score": 22,
    "yi_dang_score": 57
  },
  "da_yun": [
    {
      "age_start": 0,
      "age_end": 10,
      "gan": "壬",
      "zhi": "午",
      "gan_zhi": "壬午"
    },
    // ... 更多大运
  ],
  "true_solar_time": "1990-05-15 14:15:37"
}
```

## 字段说明

### chart (四柱详情)

- **pillars**: 四柱详细信息数组
  - `name`: 柱名称（年柱/月柱/日柱/时柱）
  - `gan`: 天干
  - `zhi`: 地支
  - `gan_zhi`: 干支组合
  - `cang_gan`: 藏干列表，每个包含 `gan`（天干）和 `score`（分数）
  - `na_yin`: 纳音五行
  - `zi_zuo`: 自坐（仅日柱有值）
  - `gan_wuxing`: 天干五行
  - `zhi_wuxing`: 地支五行

- **si_zhu**: 四柱干支（简化版）
- **shi_shen**: 十神配置
- **day_gan**: 日主天干
- **day_zhi**: 日主地支

### five_elements (五行能量)

- **scores**: 五行得分（木、火、土、金、水）
- **percentages**: 五行占比（百分比）
- **strongest**: 最旺的五行
- **weakest**: 最弱的五行
- **missing**: 缺失五行描述（如 "缺金" 或 "五行齐全"）
- **details**: 详细计算过程（用于调试）

### gods (用神分析)

- **useful_god**: 主要用神（五行）
- **useful_gods**: 所有用神列表
- **taboo_god**: 主要忌神（五行）
- **taboo_gods**: 所有忌神列表
- **day_gan**: 日主天干
- **day_wuxing**: 日主五行
- **is_strong**: 日主是否偏强（true/false）
- **tong_dang_score**: 同党得分（印、比劫）
- **yi_dang_score**: 异党得分（食伤、财、官杀）

### da_yun (大运)

大运列表，每个包含：
- `age_start`: 起始年龄
- `age_end`: 结束年龄
- `gan`: 大运天干
- `zhi`: 大运地支
- `gan_zhi`: 大运干支组合

### true_solar_time

真太阳时（字符串格式：YYYY-MM-DD HH:MM:SS）

## 前端使用建议

1. **四柱展示**: 使用 `chart.pillars` 展示详细的四柱信息
2. **五行可视化**: 使用 `five_elements.scores` 和 `percentages` 绘制五行能量图
3. **用神提示**: 使用 `gods.useful_god` 和 `gods.taboo_god` 显示用神建议
4. **性格分析**: 结合 `five_elements.missing` 和 `gods.is_strong` 进行性格解读

## API 响应格式

在 `/api/fortune` 接口中，BaziReport 通过以下格式返回：

```
data: {"type": "bazi_report", "data": {...BaziReport数据...}}
```

前端需要监听 `type === "bazi_report"` 的响应，获取完整的分析数据。
