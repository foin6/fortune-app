# 🏗️ 部署架构说明

## 📊 项目结构

你的项目包含两部分：

### 1. 前端（Frontend）
- **技术栈**: React + Vite
- **类型**: 静态文件（HTML, CSS, JavaScript）
- **部署平台**: Vercel（或其他静态托管服务）

### 2. 后端（Backend）
- **技术栈**: Python FastAPI
- **类型**: 服务器应用（需要运行 Python 代码）
- **部署平台**: 需要支持 Python 的云服务（**不能**用 Vercel）

## ⚠️ 重要说明

### Vercel 只部署前端！

**Vercel 的特点：**
- ✅ 适合：静态网站、前端应用（React, Vue, Next.js 等）
- ❌ **不适合**：Python 后端、需要运行服务器的应用
- ❌ **不能**：运行你的 `main.py`（FastAPI 后端）

### 你的后端需要单独部署！

**后端（main.py）包含：**
- FastAPI 服务器
- AI API 调用（Compass/DeepSeek）
- 数据库操作
- 八字计算逻辑

这些**不能**部署到 Vercel，需要部署到支持 Python 的平台。

## 🚀 完整部署方案

### 方案 1: Vercel（前端）+ Railway（后端）⭐ 推荐

**前端部署（Vercel）：**
- 部署 React 应用
- 免费，自动 HTTPS
- 全球 CDN 加速

**后端部署（Railway）：**
- 部署 Python FastAPI
- 支持环境变量
- 自动部署
- 有免费额度

**优点：**
- 简单易用
- 免费额度充足
- 自动部署

### 方案 2: Vercel（前端）+ Render（后端）

**前端部署（Vercel）：**
- 同上

**后端部署（Render）：**
- 部署 Python FastAPI
- 免费套餐可用（但可能较慢）
- 支持环境变量

**优点：**
- 完全免费
- 配置简单

**缺点：**
- 免费套餐可能较慢
- 有休眠机制

### 方案 3: Vercel（前端）+ Fly.io（后端）

**前端部署（Vercel）：**
- 同上

**后端部署（Fly.io）：**
- 部署 Python FastAPI
- 性能好
- 全球分布

**优点：**
- 性能优秀
- 全球 CDN

**缺点：**
- 配置稍复杂

### 方案 4: 全栈部署（不推荐用于生产）

**Vercel Serverless Functions：**
- 可以运行 Python 代码
- 但有限制（执行时间、内存等）
- 不适合你的 FastAPI 应用

**不推荐原因：**
- FastAPI 需要持续运行
- 你的应用有数据库连接
- 需要流式响应（SSE）

## 📋 推荐部署流程

### 第一步：部署后端（Python FastAPI）

**使用 Railway（推荐）：**

1. 访问：https://railway.app
2. 使用 GitHub 登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择你的 `fortune-app` 仓库
5. 配置：
   - **Root Directory**: 留空（根目录）
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. 添加环境变量：
   - `COMPASS_API_KEY`: 你的 Compass API key
   - `DEEPSEEK_API_KEY`: 你的 DeepSeek API key（如果有）
   - `ALLOWED_ORIGINS`: 你的 Vercel 域名（如 `https://fortune-app.vercel.app`）
7. 部署完成后，Railway 会给你一个 URL（如 `https://your-app.railway.app`）

### 第二步：部署前端（React）

**使用 Vercel：**

1. 访问：https://vercel.com
2. 导入 `fortune-app` 仓库
3. 配置：
   - **Root Directory**: `frontend`
   - **Build Command**: 留空
   - **Output Directory**: `dist`
4. 添加环境变量：
   - `VITE_API_BASE_URL`: 你的 Railway 后端地址（如 `https://your-app.railway.app`）
5. 部署

### 第三步：更新后端 CORS

在后端（Railway）环境变量中：
- `ALLOWED_ORIGINS`: 添加你的 Vercel 域名

## 🔗 连接前后端

**前端配置：**
```javascript
// frontend/src/utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

**后端配置：**
```python
# main.py
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
```

## 💰 成本对比

| 平台 | 前端 | 后端 | 免费额度 |
|------|------|------|----------|
| Vercel | ✅ 免费 | ❌ 不支持 | 无限 |
| Railway | ❌ 不支持 | ✅ $5/月 | $5 免费额度 |
| Render | ❌ 不支持 | ✅ 免费（慢） | 有限 |
| Fly.io | ❌ 不支持 | ✅ 按使用量 | 有免费额度 |

## 🎯 总结

**回答你的问题：**

1. **一定要用 Vercel 吗？**
   - 不一定，但 Vercel 是部署前端的最佳选择之一
   - 也可以考虑：Netlify, Cloudflare Pages, GitHub Pages

2. **Vercel 是静态部署吗？**
   - 是的，Vercel 主要用于静态文件部署
   - 你的前端（React）编译后就是静态文件

3. **含有 AI 的也用 Vercel？**
   - **不行！** 后端（包含 AI API 调用）需要单独部署
   - 推荐：Railway, Render, Fly.io

## 📝 下一步

1. **先部署后端**（Railway 或其他平台）
2. **获取后端 URL**
3. **再部署前端**（Vercel）
4. **配置前端环境变量**（指向后端 URL）
5. **配置后端 CORS**（允许前端域名）

需要我帮你部署后端吗？
