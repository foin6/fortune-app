# 前端开发需求文档

## 项目信息

- **后端地址**: `http://localhost:8000`
- **API 接口**: `POST /api/fortune`
- **响应类型**: SSE (Server-Sent Events) 流式响应

## 技术栈

- **框架**: React + Vite
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **HTTP 客户端**: Fetch API (原生，支持 SSE)

## 设计风格

- **色调**: 黑白灰主色调，干净极简
- **风格**: 带有神秘感
- **参考**: 见截图（Dashboard 和 Input Form）

## 页面结构

### 1. Dashboard 页面 (`/`)

**布局**:
- 左侧：Sidebar 导航栏
- 右侧：主内容区

**Sidebar 组件**:
- Logo: 罗盘图标 + "Compass AI"
- 副标题: "智能占卜平台"
- 导航项:
  - 首页
  - 生成八字
  - 起卦
  - 人生K线

**Main Content**:
- 欢迎语: "Welcome to Compass AI"
- 黑色按钮: "创建八字命理"
- 点击按钮跳转到 `/create`

### 2. Input Form 页面 (`/create`)

**标题**: "创建我的八字命理"

**表单字段**:
1. **命书名称** (必填)
   - 输入框，placeholder: "我的命书、妈妈的命书、张三"
   - 提示: "给这个命书起个名字,方便以后查找和切换"

2. **历法类型** (单选)
   - Tab 切换: "阳历(公历)" / "阴历(农历)"
   - 默认: 阳历

3. **出生日期** (必填)
   - 三个输入框: 年、月、日
   - 格式: 数字输入

4. **出生时间** (必填)
   - 两个输入框: 时、分
   - 24小时制
   - 提示: "请使用24小时制,如下午3点30分输入 15:30"

5. **性别** (单选)
   - 选项: "男(乾造)" / "女(坤造)"

6. **出生地点** (必填)
   - 输入框，placeholder: "北京"
   - 可输入城市名称

7. **经纬度** (必填)
   - 经度(E): 数字输入，如 116.4074
   - 纬度(N): 数字输入，如 39.9042
   - 提示: "推荐使用定位按钮获取精确坐标,或手动输入经纬度以确保真太阳时计算准确"

8. **真太阳时选项** (可展开)
   - 复选框: "使用真太阳时"
   - 说明文字:
     ```
     什么是真太阳时？
     真太阳时是根据太阳实际位置计算的时间，不同经度的地区会有差异。例如，北京时间12:50，在沈阳的真太阳时约为13:04。
     
     是否需要使用真太阳时？
     传统命理学派对此有不同看法。如果您的出生时间接近时辰交界（如13:00），建议尝试两种方式，看哪个更符合您的实际情况。大多数在线排盘工具默认不使用真太阳时。
     ```

**底部按钮**:
- "创建个人命理" (主要按钮，黑色)
- "取消" (次要按钮)

**交互逻辑**:
- 表单验证
- 提交后调用 `/api/fortune` 接口
- 跳转到结果页面 (`/result`)

### 3. Result Stream 页面 (`/result`)

**布局**:
- 顶部: 八字四柱信息展示
- 下方: 流式分析结果（打字机效果）

**八字四柱显示**:
- 显示从 `calculation` 类型响应中获取的数据
- 格式: 年柱、月柱、日柱、时柱
- 样式: 卡片或表格形式

**流式文本显示**:
- 实时接收 `text` 类型的响应
- 逐字显示（打字机效果）
- 支持滚动

**图表数据** (可选):
- 如果收到 `chart_data` 类型响应
- 可以显示 20-60 岁运势评分图表

## 组件结构

```
src/
├── App.jsx                 # 主应用组件，路由配置
├── components/
│   ├── Sidebar.jsx         # 侧边栏导航
│   ├── BirthForm.jsx       # 出生信息表单
│   ├── ResultStream.jsx    # 结果流式显示
│   └── BaziDisplay.jsx     # 八字四柱显示组件
├── pages/
│   ├── Dashboard.jsx       # 首页
│   ├── CreateForm.jsx      # 创建表单页
│   └── Result.jsx          # 结果页
└── utils/
    └── api.js              # API 调用工具函数
```

## API 调用实现

### 关键代码片段

**SSE 流式接收**:
```javascript
async function fetchFortuneAnalysis(formData) {
  const response = await fetch('http://localhost:8000/api/fortune', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: formData.name,
      gender: formData.gender === '男' ? 'male' : 'female',
      birth_date: `${formData.year}-${String(formData.month).padStart(2, '0')}-${String(formData.day).padStart(2, '0')}`,
      birth_time: `${String(formData.hour).padStart(2, '0')}:${String(formData.minute).padStart(2, '0')}`,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      city: formData.city,
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // 保留最后一个不完整的行

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') {
          return;
        }

        try {
          const json = JSON.parse(data);
          // 处理不同类型的响应
          handleResponse(json);
        } catch (e) {
          console.error('Parse error:', e, data);
        }
      }
    }
  }
}
```

## 路由配置

使用 React Router:

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/create" element={<CreateForm />} />
  <Route path="/result" element={<Result />} />
</Routes>
```

## 开发注意事项

1. **CORS**: 后端已配置允许所有来源，无需额外配置
2. **错误处理**: 需要处理网络错误、API 错误等情况
3. **加载状态**: 提交表单后显示加载状态
4. **数据持久化**: 可以考虑使用 localStorage 保存已创建的命书
5. **响应式设计**: 确保在不同屏幕尺寸下正常显示

## 测试数据

```javascript
const testFormData = {
  name: "测试",
  calendar: "solar", // "solar" 或 "lunar"
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  gender: "male",
  city: "北京",
  lng: 116.4074,
  lat: 39.9042,
  useTrueSolarTime: false,
};
```
