# Compass AI 前端应用

智能占卜平台前端，使用 React + Vite + Tailwind CSS 构建。

## 技术栈

- **React 18** - UI 框架
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **React Router** - 路由管理
- **Lucide React** - 图标库

## 安装依赖

```bash
cd frontend
npm install
```

## 开发运行

```bash
npm run dev
```

前端服务将在 `http://localhost:3000` 启动。

## 构建生产版本

```bash
npm run build
```

## 项目结构

```
frontend/
├── src/
│   ├── components/      # 可复用组件
│   │   ├── Sidebar.jsx      # 侧边栏导航
│   │   ├── BirthForm.jsx    # 出生信息表单
│   │   ├── BaziDisplay.jsx  # 八字四柱显示
│   │   └── ResultStream.jsx # 流式文本显示
│   ├── pages/          # 页面组件
│   │   ├── Dashboard.jsx    # 首页
│   │   ├── CreateForm.jsx   # 创建表单页
│   │   └── Result.jsx       # 结果页
│   ├── utils/          # 工具函数
│   │   └── api.js           # API 调用
│   ├── App.jsx         # 主应用组件
│   ├── main.jsx        # 入口文件
│   └── index.css       # 全局样式
├── public/             # 静态资源
├── index.html          # HTML 模板
├── package.json        # 项目配置
├── vite.config.js      # Vite 配置
├── tailwind.config.js  # Tailwind 配置
└── postcss.config.js   # PostCSS 配置
```

## 功能特性

1. **Dashboard 首页** - 欢迎页面和导航入口
2. **创建表单** - 完整的出生信息输入表单，包含：
   - 命书名称
   - 历法类型（阳历/阴历）
   - 出生日期和时间
   - 性别选择
   - 出生地点和经纬度（支持定位）
   - 真太阳时选项
3. **结果页面** - 流式显示命理分析结果：
   - 八字四柱展示
   - 实时流式文本（打字机效果）
   - 图表数据接收（可扩展）

## API 集成

前端通过 SSE (Server-Sent Events) 与后端 API (`http://localhost:8000/api/fortune`) 通信，实现流式数据接收。

## 注意事项

- 确保后端服务在 `http://localhost:8000` 运行
- 浏览器需要支持地理定位 API（用于获取经纬度）
- 表单数据会临时保存在 localStorage 中
