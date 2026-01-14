# 🔴 关键修复：Root Directory 已设置但仍失败

## 问题分析

你已经设置了 Root Directory 为 `frontend`，但构建日志仍然显示：
```
Running "install" command: `cd frontend && npm install`
sh: line 1: cd: frontend: No such file or directory
```

**原因**：当 Root Directory 设置为 `frontend` 时，Vercel 已经在 `frontend` 目录下执行命令了，所以不需要再 `cd frontend`。

## 🔧 解决方案

### 步骤 1：清除构建命令配置

在 Vercel 项目设置中：

1. 进入项目 → **Settings** → **General**
2. 找到 **"Build & Development Settings"** 部分
3. 找到以下字段并**清空**它们（让 Vercel 自动检测）：
   - **Build Command**: 留空（或设置为 `npm run build`，**不要**包含 `cd frontend`）
   - **Install Command**: 留空（或设置为 `npm install`，**不要**包含 `cd frontend`）
   - **Output Directory**: 设置为 `dist`（**不要**包含 `frontend/`）
4. 点击 **"Save"**

### 步骤 2：确认 Root Directory

确保 **Root Directory** 仍然设置为 `frontend`。

### 步骤 3：删除 vercel.json（推荐）

由于 Root Directory 已经设置，`vercel.json` 可能会干扰配置。让我们删除它：

```bash
# 我会帮你删除
```

或者你可以：
1. 在 GitHub 上删除 `vercel.json` 文件
2. 或者在本地删除后推送

### 步骤 4：重新部署

1. 回到项目主页面
2. 点击 **"Deployments"** 标签
3. 找到失败的部署
4. 点击 **"..."** → **"Redeploy"**

## ✅ 正确的配置应该是：

- **Root Directory**: `frontend` ✅
- **Build Command**: `npm run build`（或留空自动检测）✅
- **Install Command**: `npm install`（或留空自动检测）✅
- **Output Directory**: `dist` ✅

**不要**在任何命令中包含 `cd frontend`，因为 Root Directory 已经处理了这一点。
