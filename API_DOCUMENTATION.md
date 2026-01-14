# 后端 API 文档

## 服务地址
- **Base URL**: `http://localhost:8000`
- **运行状态**: 服务已启动并运行中

## API 接口

### POST /api/fortune

命理分析接口，接收用户信息，返回流式命理分析结果。

#### 请求格式

**URL**: `http://localhost:8000/api/fortune`

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "张三",
  "gender": "male",
  "birth_date": "1990-05-15",
  "birth_time": "14:30",
  "lat": 39.9042,
  "lng": 116.4074,
  "city": "北京"
}
```

**字段说明**:
- `name` (string, 必填): 姓名
- `gender` (string, 必填): 性别，支持 "male"/"female" 或 "男"/"女"
- `birth_date` (string, 必填): 出生日期，格式 "YYYY-MM-DD"
- `birth_time` (string, 必填): 出生时间，格式 "HH:MM" (24小时制)
- `lat` (float, 必填): 纬度（北纬为正）
- `lng` (float, 必填): 经度（东经为正）
- `city` (string, 必填): 城市名称

#### 响应格式

**Content-Type**: `text/event-stream` (Server-Sent Events)

**响应流格式**:
```
data: {"type": "text", "content": "分析文本片段..."}
data: {"type": "text", "content": "继续分析..."}
data: {"type": "chart_data", "data": {"career": [...], "relationship": [...], "wealth": [...]}}
data: {"type": "calculation", "data": {...}}
data: [DONE]
```

**响应类型说明**:

1. **type: "text"**
   - 流式文本内容，需要拼接显示
   - 字段: `content` (string)

2. **type: "chart_data"**
   - 图表数据（20-60岁运势评分）
   - 字段: `data` (object)
     - `career`: [number] - 事业评分数组（41个数据点）
     - `relationship`: [number] - 感情评分数组（41个数据点）
     - `wealth`: [number] - 财运评分数组（41个数据点）

3. **type: "bazi_report"** (已更新)
   - 完整的八字分析报告（BaziReport）
   - 字段: `data` (object)
     - `chart`: object - 四柱详情
       - `pillars`: array - 四柱详细信息（包含藏干、纳音、自坐等）
       - `si_zhu`: object - 四柱干支
       - `shi_shen`: object - 十神配置
       - `day_gan`: string - 日主天干
       - `day_zhi`: string - 日主地支
     - `five_elements`: object - 五行能量分析
       - `scores`: object - 五行得分 {木: 20, 火: 60, ...}
       - `percentages`: object - 五行占比 {木: 15.5%, 火: 46.5%, ...}
       - `strongest`: string - 最旺五行
       - `weakest`: string - 最弱五行
       - `missing`: string - 缺失五行描述
       - `details`: array - 详细计算过程
     - `gods`: object - 用神分析
       - `useful_god`: string - 主要用神
       - `useful_gods`: array - 所有用神列表
       - `taboo_god`: string - 主要忌神
       - `taboo_gods`: array - 所有忌神列表
       - `day_gan`: string - 日主天干
       - `day_wuxing`: string - 日主五行
       - `is_strong`: boolean - 日主是否偏强
       - `tong_dang_score`: number - 同党得分
       - `yi_dang_score`: number - 异党得分
     - `da_yun`: array - 大运列表
     - `true_solar_time`: string - 真太阳时

4. **type: "error"**
   - 错误信息
   - 字段: `error` (string)

5. **"[DONE]"**
   - 流式传输结束标记

#### 前端调用示例

**使用 Fetch API (SSE)**:
```javascript
async function callFortuneAPI(formData) {
  const response = await fetch('http://localhost:8000/api/fortune', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: formData.name,
      gender: formData.gender,
      birth_date: formData.birth_date,
      birth_time: formData.birth_time,
      lat: formData.lat,
      lng: formData.lng,
      city: formData.city,
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          // 流结束
          return;
        }
        
        try {
          const json = JSON.parse(data);
          // 处理不同类型的响应
          if (json.type === 'text') {
            // 追加文本内容
            appendText(json.content);
          } else if (json.type === 'chart_data') {
            // 处理图表数据
            handleChartData(json.data);
          } else if (json.type === 'calculation') {
            // 显示八字排盘
            displayBazi(json.data);
          } else if (json.error) {
            // 处理错误
            handleError(json.error);
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
  }
}
```

**使用 EventSource (不推荐，因为需要 GET 请求)**:
EventSource 不支持 POST，建议使用 Fetch API + ReadableStream。

## 其他接口

### GET /health

健康检查接口

**响应**:
```json
{
  "status": "healthy",
  "compass_configured": true
}
```

### GET /

根路径，返回 API 信息

**响应**:
```json
{
  "message": "命理分析 API",
  "version": "1.0.0",
  "endpoints": {
    "POST /api/fortune": "命理分析接口"
  }
}
```

## 测试命令

```bash
# 测试健康检查
curl http://localhost:8000/health

# 测试命理分析接口
curl -X POST "http://localhost:8000/api/fortune" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试",
    "gender": "male",
    "birth_date": "1990-05-15",
    "birth_time": "14:30",
    "lat": 39.9042,
    "lng": 116.4074,
    "city": "北京"
  }' \
  --no-buffer
```

## 注意事项

1. **CORS**: 后端已配置允许所有来源，前端可以直接调用
2. **流式响应**: 使用 SSE (Server-Sent Events) 格式
3. **错误处理**: 如果 API key 未配置或调用失败，会返回 error 类型的响应
4. **数据格式**: 所有时间使用 24 小时制，日期使用 YYYY-MM-DD 格式
