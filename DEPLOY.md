# 🚀 Vercel 部署指南

## ⚠️ 关键配置步骤

### 步骤 1: 进入 Vercel 项目设置

1. 访问：https://vercel.com/dashboard
2. 找到 `fortune-app` 项目
3. 点击项目进入详情页
4. 点击顶部 **"Settings"** 标签

### 步骤 2: 配置 Root Directory（必须！）

1. 在 Settings 页面，点击左侧 **"General"**
2. 向下滚动找到 **"Root Directory"**
3. 点击 **"Edit"** 按钮
4. 输入：`frontend`
5. 点击 **"Save"**

### 步骤 3: 配置 Build & Development Settings

1. 在 Settings → General 页面，找到 **"Build & Development Settings"**
2. 点击 **"Override"** 或 **"Edit"**
3. 配置以下字段：

   **Build Command:**
   - 留空（让 Vercel 自动检测）
   - 或者设置为：`npm run build`

   **Install Command:**
   - 留空（让 Vercel 自动检测）
   - 或者设置为：`npm install`

   **Output Directory:**
   - 设置为：`dist`
   - ⚠️ **不要**写 `frontend/dist`

   **Development Command:**
   - 留空或设置为：`npm run dev`

4. 点击 **"Save"**

### 步骤 4: 配置环境变量

1. 在 Settings 页面，找到 **"Environment Variables"**
2. 点击 **"Add New"**
3. 添加：
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `http://localhost:8000`（暂时，后端部署后改）
   - **Environment**: 全选（Production, Preview, Development）
4. 点击 **"Save"**

### 步骤 5: 重新部署

1. 回到项目主页面
2. 点击 **"Deployments"** 标签
3. 找到最新的部署（无论成功或失败）
4. 点击右侧 **"..."** 菜单
5. 选择 **"Redeploy"**
6. 等待 1-2 分钟

## ✅ 验证部署

部署成功后：
- ✅ 部署状态显示 **"Ready"**（绿色）
- ✅ 可以访问部署链接
- ✅ 网站正常显示

## 🔍 如果还是失败

### 检查清单：

1. ✅ Root Directory 是否设置为 `frontend`？
2. ✅ Build Command 是否留空或只写 `npm run build`（不包含 `cd frontend`）？
3. ✅ Output Directory 是否设置为 `dist`（不是 `frontend/dist`）？
4. ✅ 环境变量 `VITE_API_BASE_URL` 是否已添加？

### 查看构建日志：

1. 点击失败的部署
2. 展开 **"Build Logs"**
3. 查看具体错误信息

**常见错误：**
- `cd: frontend: No such file or directory` → Root Directory 未设置或 Build Command 错误
- `Cannot find module` → 依赖安装失败，检查 package.json
- `404 Not Found` → Output Directory 配置错误

## 📝 正确的配置应该是：

```
Root Directory: frontend
Build Command: (留空) 或 npm run build
Install Command: (留空) 或 npm install
Output Directory: dist
```

**重要：** 当 Root Directory 设置为 `frontend` 时，Vercel 已经在 `frontend` 目录下执行命令，所以不需要在命令中写 `cd frontend`。
