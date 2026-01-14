# 🚀 Vercel 快速设置指南

## ⚡ 5 分钟快速部署

### 1️⃣ 访问 Vercel
👉 https://vercel.com

### 2️⃣ 登录
- 点击 **"Sign Up"** 或 **"Log In"**
- 选择 **"Continue with GitHub"**
- 授权访问

### 3️⃣ 导入项目
- 点击 **"Add New..."** → **"New Project"**
- 找到 **`fortune-app`** 仓库
- 点击 **"Import"**

### 4️⃣ 配置（重要！）

#### ⚠️ 必须设置 Root Directory
1. 在项目配置页面，找到 **"Root Directory"**
2. 点击 **"Edit"**
3. 输入：`frontend`
4. 点击 **"Continue"**

#### 环境变量
1. 展开 **"Environment Variables"**
2. 添加：
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `http://localhost:8000`（暂时，后端部署后改）
   - **Environment**: 全选（Production, Preview, Development）
3. 点击 **"Add"**

### 5️⃣ 部署
- 点击 **"Deploy"**
- 等待 1-2 分钟
- 完成！🎉

---

## 📍 关键配置说明

### Root Directory: `frontend`
**为什么必须设置？**
- 你的前端代码在 `frontend/` 目录下
- Vercel 需要知道在哪里找 `package.json`
- 如果不设置，Vercel 会在根目录找，找不到就会失败

### 环境变量: `VITE_API_BASE_URL`
**作用：**
- 前端通过这个变量知道后端 API 地址
- 开发环境：`http://localhost:8000`
- 生产环境：你的后端部署地址（如 `https://xxx.railway.app`）

---

## 🔄 更新代码后

每次你推送代码到 GitHub，Vercel 会自动重新部署！

```bash
git add .
git commit -m "更新说明"
git push origin main
```

---

## 🆘 遇到问题？

查看详细文档：`VERCEL_DEPLOY_CHECKLIST.md`
