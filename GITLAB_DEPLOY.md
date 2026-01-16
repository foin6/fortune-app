# GitLab CI/CD 部署指南

## 概述

本项目已配置 GitLab CI/CD，支持自动化构建和部署。

## 部署选项

### 1. 前端部署到 GitLab Pages（推荐，免费）

前端会自动部署到 GitLab Pages，访问地址：
```
https://judyan.gitlab.io/fortune-app
```

**配置步骤：**
1. 在 GitLab 项目设置中启用 Pages：
   - 进入项目 → Settings → Pages
   - 等待 Pipeline 运行完成后，Pages 会自动启用

2. 前端构建产物会自动发布到 Pages

### 2. Docker 镜像构建（可选）

如果需要构建 Docker 镜像：
1. 在 GitLab 项目设置中配置 Container Registry：
   - Settings → General → Visibility, project features, permissions
   - 启用 "Container Registry"

2. 手动触发 `build_docker` job 来构建镜像

### 3. 部署到服务器（需要配置）

如果需要部署到自己的服务器：

**在 GitLab 项目设置中添加 CI/CD 变量：**
- Settings → CI/CD → Variables

添加以下变量：
- `SSH_PRIVATE_KEY`: 服务器的 SSH 私钥
- `DEPLOY_SERVER_HOST`: 服务器地址（如：example.com）
- `DEPLOY_SERVER_USER`: SSH 用户名（如：root）
- `DEPLOY_SERVER_PATH`: 部署路径（如：/var/www/fortune-app）

然后手动触发 `deploy_backend` job。

## Pipeline 说明

Pipeline 包含以下阶段：

1. **build**: 构建前端和 Docker 镜像
2. **test**: 运行后端测试
3. **deploy**: 部署到目标环境

## 环境变量配置

在 GitLab 项目设置中添加必要的环境变量：
- Settings → CI/CD → Variables

**后端需要的环境变量：**
- `xxx_API_KEY`: AI API Key
- `DATABASE_URL`: 数据库连接字符串（可选，默认使用 SQLite）
- `ALLOWED_ORIGINS`: 允许的 CORS 域名（可选）

## 查看 Pipeline 状态

1. 进入项目 → CI/CD → Pipelines
2. 查看每个 job 的执行状态和日志

## 注意事项

1. **GitLab Pages 只支持静态文件**：前端可以部署，但后端 API 需要单独部署
2. **前端需要配置 API 地址**：在 `frontend/.env.production` 中设置 `VITE_API_BASE_URL`
3. **首次部署**：需要先推送代码到 GitLab，然后 Pipeline 会自动运行

## 快速开始

1. 推送代码到 GitLab：
   ```bash
   git add .gitlab-ci.yml
   git commit -m "Add GitLab CI/CD configuration"
   git push gitlab main
   ```

2. 在 GitLab 上查看 Pipeline 执行情况

3. 等待 Pipeline 完成后，访问 GitLab Pages 地址
