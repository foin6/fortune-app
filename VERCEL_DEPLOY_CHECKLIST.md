# ✅ Vercel 部署检查清单

## 📋 部署前检查

### ✅ 已完成
- [x] 代码已推送到 GitHub: https://github.com/Judyzj/fortune-app
- [x] 前端 API 配置支持环境变量 (`VITE_API_BASE_URL`)
- [x] `vercel.json` 配置文件已创建
- [x] `.gitignore` 已配置，排除敏感文件
- [x] 项目结构正确（前端在 `frontend/` 目录）

---

## 🚀 Vercel 部署步骤

### 步骤 1: 登录 Vercel
1. 访问 https://vercel.com
2. 点击右上角 **"Sign Up"** 或 **"Log In"**
3. 选择 **"Continue with GitHub"**
4. 授权 Vercel 访问你的 GitHub 账号

### 步骤 2: 导入项目
1. 登录后，点击 **"Add New..."** → **"New Project"**
2. 在项目列表中找到 **`fortune-app`**（或搜索）
3. 点击项目右侧的 **"Import"** 按钮

### 步骤 3: 配置项目设置 ⚠️ 重要

在项目配置页面，**必须**设置以下内容：

#### 基本设置
- **Project Name**: `fortune-app`（或你喜欢的名字）
- **Framework Preset**: 选择 **"Vite"** 或保持 **"Other"**

#### 构建设置（点击 "Edit" 展开）
- **Root Directory**: 点击 "Edit"，输入 `frontend` ⚠️ **必须设置**
- **Build Command**: `npm run build`（通常自动填充）
- **Output Directory**: `dist`（通常自动填充）
- **Install Command**: `npm install`（通常自动填充）

#### 环境变量（Environment Variables）
点击 "Environment Variables" 部分，添加：

| Key | Value | 说明 |
|-----|-------|------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | 暂时使用本地地址（测试用）<br>后端部署后改为后端地址 |

**添加方法：**
1. 点击 "Add" 或 "+"
2. Key: `VITE_API_BASE_URL`
3. Value: `http://localhost:8000`（或你的后端地址）
4. 选择环境：**Production, Preview, Development**（全选）
5. 点击 "Save"

### 步骤 4: 部署
1. 确认所有设置正确
2. 点击页面底部的 **"Deploy"** 按钮
3. 等待 1-2 分钟，Vercel 会自动：
   - 安装依赖 (`npm install`)
   - 构建项目 (`npm run build`)
   - 部署到 CDN

### 步骤 5: 获取访问链接
部署完成后，你会看到：
- ✅ **"Congratulations! Your project has been deployed."**
- 🌐 **访问链接**: `https://fortune-app-xxxxx.vercel.app`

**这个链接就是你的公网访问地址！** 🎉

---

## 🔧 常见问题排查

### 问题 1: 构建失败
**错误**: `Cannot find module` 或 `Build failed`

**解决方案**:
1. 检查 **Root Directory** 是否设置为 `frontend`
2. 检查 **Build Command** 是否为 `npm run build`
3. 查看 Vercel 构建日志，找到具体错误

### 问题 2: 页面空白或 404
**原因**: 路由配置问题

**解决方案**:
- 确认 `vercel.json` 中的 `rewrites` 配置正确
- 检查前端路由是否使用 `BrowserRouter`

### 问题 3: API 请求失败
**错误**: `CORS error` 或 `Network error`

**解决方案**:
1. 检查环境变量 `VITE_API_BASE_URL` 是否正确设置
2. 确认后端已部署并允许跨域请求
3. 检查后端 CORS 配置中的 `ALLOWED_ORIGINS` 是否包含 Vercel 域名

### 问题 4: 环境变量不生效
**原因**: Vercel 需要重新部署才能应用新的环境变量

**解决方案**:
1. 添加/修改环境变量后
2. 进入项目 → **Settings** → **Environment Variables**
3. 点击 **"Redeploy"** 重新部署

---

## 📝 部署后操作

### 1. 更新后端地址（如果后端已部署）
1. 进入 Vercel 项目
2. 点击 **Settings** → **Environment Variables**
3. 编辑 `VITE_API_BASE_URL`
4. 改为后端地址（如 `https://your-backend.railway.app`）
5. 点击 **"Redeploy"**

### 2. 配置自定义域名（可选）
1. 进入项目 → **Settings** → **Domains**
2. 添加你的域名
3. 按照提示配置 DNS

### 3. 设置自动部署
默认已启用：每次推送到 GitHub 的 `main` 分支，Vercel 会自动重新部署。

---

## 🔗 有用的链接

- **Vercel Dashboard**: https://vercel.com/dashboard
- **项目地址**: https://github.com/Judyzj/fortune-app
- **Vercel 文档**: https://vercel.com/docs

---

## ✅ 部署成功检查

部署成功后，访问你的 Vercel 链接，应该能看到：
- ✅ 页面正常加载
- ✅ 前端界面显示正常
- ✅ 可以填写表单（虽然 API 可能还连不上，但前端应该能工作）

如果后端还没部署，前端会显示 API 连接错误，这是正常的。等后端部署后，更新 `VITE_API_BASE_URL` 环境变量即可。
