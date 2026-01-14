# 前后端字段对应关系

## CORS 配置检查 ✅

后端 `main.py` 已正确配置 CORS：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],    # 允许所有 HTTP 方法
    allow_headers=["*"],     # 允许所有请求头
)
```

**测试结果：** CORS 预检请求（OPTIONS）返回正确的响应头：
- `access-control-allow-origin: http://localhost:3000` ✅
- `access-control-allow-methods: DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT` ✅
- `access-control-allow-credentials: true` ✅
- `access-control-allow-headers: Content-Type` ✅

## 字段对应关系 ✅

### 后端期望的字段（FortuneRequest）

| 字段名 | 类型 | 格式/说明 |
|--------|------|-----------|
| `name` | str | 姓名 |
| `gender` | str | 性别：'male' 或 'female' |
| `birth_date` | str | 出生日期：'YYYY-MM-DD' |
| `birth_time` | str | 出生时间：'HH:MM' (24小时制) |
| `lat` | float | 纬度（北纬为正） |
| `lng` | float | 经度（东经为正） |
| `city` | str | 城市名称 |

### 前端发送的字段（fetchBaziCalculation）

| 前端字段 | 转换逻辑 | 后端字段 | 状态 |
|---------|---------|---------|------|
| `formData.name` | 直接传递 | `name` | ✅ 匹配 |
| `formData.gender` | `'男(乾造)'` → `'male'`<br>`'女(坤造)'` → `'female'` | `gender` | ✅ 匹配 |
| `formData.year`<br>`formData.month`<br>`formData.day` | 组合为 `'YYYY-MM-DD'`<br>月份和日期补零 | `birth_date` | ✅ 匹配 |
| `formData.hour`<br>`formData.minute` | 组合为 `'HH:MM'`<br>补零 | `birth_time` | ✅ 匹配 |
| `formData.lat` | `parseFloat()` 转换 | `lat` | ✅ 匹配 |
| `formData.lng` | `parseFloat()` 转换 | `lng` | ✅ 匹配 |
| `formData.city` | 直接传递 | `city` | ✅ 匹配 |

## 数据转换示例

### 前端表单数据
```javascript
{
  name: "测试命书",
  gender: "男(乾造)",
  year: 2000,
  month: 10,
  day: 10,
  hour: 12,
  minute: 8,
  lat: "31.1648",
  lng: "121.3837",
  city: "陕西"
}
```

### 转换后的请求数据
```javascript
{
  name: "测试命书",
  gender: "male",              // 转换：'男(乾造)' → 'male'
  birth_date: "2000-10-10",    // 组合：year-month-day，补零
  birth_time: "12:08",         // 组合：hour:minute，补零
  lat: 31.1648,                // 转换：parseFloat()
  lng: 121.3837,               // 转换：parseFloat()
  city: "陕西"
}
```

### 后端接收验证 ✅
```python
FortuneRequest(
    name="测试命书",
    gender="male",
    birth_date="2000-10-10",
    birth_time="12:08",
    lat=31.1648,
    lng=121.3837,
    city="陕西"
)
# ✅ 验证通过
```

## 总结

✅ **CORS 配置正确**：允许前端 `http://localhost:3000` 访问后端 `http://localhost:8000`

✅ **字段完全对应**：前端发送的字段名和格式与后端期望的完全匹配

✅ **数据转换正确**：所有字段都经过正确的格式转换（日期组合、性别转换、数值转换）

## 测试建议

如果遇到跨域问题，请检查：
1. 后端服务是否运行在 `http://localhost:8000`
2. 前端服务是否运行在 `http://localhost:3000`
3. 浏览器控制台是否有 CORS 错误信息

如果遇到字段错误，请检查：
1. 前端表单数据是否完整（所有必填字段）
2. 日期和时间格式是否正确（YYYY-MM-DD 和 HH:MM）
3. 经纬度是否为有效数字
