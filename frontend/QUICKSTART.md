# 快速启动指南

## 前置要求

1. 已安装 Node.js (v16 或更高版本)
2. 后端服务正在运行在 `http://localhost:8000`

## 安装和运行步骤

### 1. 安装依赖

```bash
cd /Users/zijun.yan/fortune_app/frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

前端应用将在 `http://localhost:3000` 启动，浏览器会自动打开。

### 3. 测试流程

1. **访问首页** (`http://localhost:3000`)
   - 看到 "Welcome to Compass AI" 欢迎页面
   - 点击 "创建八字命理" 按钮

2. **填写表单** (`/create`)
   - 输入命书名称（如：我的命书）
   - 选择历法类型（默认：阳历）
   - 输入出生日期（年、月、日）
   - 输入出生时间（时、分，24小时制）
   - 选择性别
   - 输入出生地点（如：北京）
   - 输入或使用定位按钮获取经纬度
   - 点击 "创建个人命理"

3. **查看结果** (`/result`)
   - 自动跳转到结果页面
   - 显示八字四柱信息
   - 实时流式显示命理分析文本（打字机效果）
   - 等待分析完成

## 测试数据示例

如果后端服务正常运行，可以使用以下测试数据：

- **命书名称**: 测试
- **历法类型**: 阳历(公历)
- **出生日期**: 1990年5月15日
- **出生时间**: 14:30
- **性别**: 男(乾造)
- **出生地点**: 北京
- **经度**: 116.4074
- **纬度**: 39.9042

## 常见问题

### 1. 端口被占用

如果 3000 端口被占用，Vite 会自动尝试其他端口，查看终端输出确认实际端口。

### 2. 后端连接失败

确保后端服务在 `http://localhost:8000` 运行：
```bash
# 在项目根目录
cd /Users/zijun.yan/fortune_app
python main.py
```

### 3. 依赖安装失败

尝试清除缓存后重新安装：
```bash
rm -rf node_modules package-lock.json
npm install
```

### 4. 样式不显示

确保 Tailwind CSS 已正确配置，检查 `tailwind.config.js` 和 `postcss.config.js` 文件。

## 开发说明

- 修改代码后会自动热重载
- 所有组件使用 Tailwind CSS 进行样式设计
- API 调用使用 Fetch API 和 SSE 流式处理
- 表单数据临时保存在 localStorage 中
