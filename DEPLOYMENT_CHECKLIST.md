# 🚀 部署检查清单

## ✅ 代码同步状态

- [x] 所有代码改动已提交到 GitHub
- [x] 权限控制功能已实现（用户只能访问自己的命书）
- [x] 起卦界面跳转问题已修复
- [x] 代码清理完成（删除无用文档和代码）

## 📋 部署前准备

### 1. 环境变量配置

创建 `.env` 文件，包含以下必需的环境变量：

```bash
# AI API Keys（必需）
COMPASS_API_KEY=你的compass_api_key
# 或
DEEPSEEK_API_KEY=你的deepseek_api_key

# CORS 配置（必需）
ALLOWED_ORIGINS=https://你的前端域名.com,https://另一个域名.com

# 数据库配置（可选，默认使用 SQLite）
DATABASE_URL=sqlite:///./fortune_app.db
# 或 PostgreSQL（生产环境推荐）
# DATABASE_URL=postgresql://user:password@localhost:5432/fortune_app

# 环境标识（可选）
ENV=production
```

### 2. 依赖安装

```bash
# 安装 Python 依赖
pip install -r requirements.txt
```

### 3. 数据库初始化

数据库会在首次运行时自动创建，无需手动初始化。

## 🖥️ 部署方式选择

### 方式 1: 虚拟机部署（推荐，公司内网）

参考文档：`VM_DEPLOY.md`

**快速部署：**
```bash
# 1. 克隆代码
git clone https://github.com/Judyzj/fortune-app.git
cd fortune-app

# 2. 运行部署脚本
chmod +x deploy.sh
./deploy.sh

# 3. 编辑环境变量
nano .env

# 4. 重启服务
sudo systemctl restart fortune-app
```

**或使用 Docker：**
```bash
docker build -t fortune-app .
docker run -d -p 8000:8000 \
  -e COMPASS_API_KEY=你的key \
  -e ALLOWED_ORIGINS=https://你的域名.com \
  --name fortune-app \
  --restart always \
  fortune-app
```

### 方式 2: 云平台部署

- **Render**: 参考 `RENDER_BASIC_CONFIG.md`
- **Fly.io**: 参考 `FLYIO_DEPLOY.md`
- **Railway**: 参考 `RAILWAY_DEPLOY.md`
- **其他选项**: 参考 `FREE_DEPLOY_OPTIONS.md`

## 🔧 前端部署

### Vercel 部署（推荐）

1. 在 Vercel 中导入 GitHub 仓库
2. 设置 Root Directory 为 `frontend`
3. 配置环境变量：
   ```
   VITE_API_BASE_URL=https://你的后端域名.com
   ```
4. 部署

### 手动部署

```bash
cd frontend
npm install
npm run build
# 将 dist 目录部署到静态服务器
```

## ✅ 部署后验证

### 1. 健康检查

```bash
curl http://你的后端域名:8000/health
```

应该返回：
```json
{"status": "ok"}
```

### 2. 测试 API

```bash
curl -X POST http://你的后端域名:8000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试",
    "gender": "male",
    "birth_date": "1990-01-01",
    "birth_time": "12:00",
    "lat": 39.9042,
    "lng": 116.4074,
    "city": "北京"
  }'
```

### 3. 前端连接测试

1. 打开前端页面
2. 尝试创建命理
3. 检查浏览器控制台是否有错误
4. 确认 API 调用成功

## 🔒 安全配置

### 生产环境必须配置：

1. **CORS 白名单**：设置 `ALLOWED_ORIGINS`，不要使用 `*`
2. **API Key 保护**：确保 API Key 不会泄露到前端代码
3. **HTTPS**：使用 HTTPS 保护数据传输
4. **用户认证**：生产环境应实现 JWT 认证（当前为开发模式）

### 权限控制

- ✅ 用户只能访问自己创建的命书
- ✅ 所有命书相关接口都有权限验证
- ⚠️ 生产环境需要实现真正的 JWT 认证

## 📝 常见问题

### 1. 数据库连接失败

**问题**：`sqlalchemy.exc.OperationalError`

**解决**：
- 检查 `DATABASE_URL` 是否正确
- 确保数据库服务正在运行
- 检查数据库用户权限

### 2. CORS 错误

**问题**：`Access-Control-Allow-Origin`

**解决**：
- 检查 `ALLOWED_ORIGINS` 环境变量
- 确保前端域名在允许列表中
- 检查后端 CORS 配置

### 3. API Key 无效

**问题**：`401 Unauthorized` 或 `API key is invalid`

**解决**：
- 检查 API Key 是否正确设置
- 确认 API Key 有足够的配额
- 检查环境变量是否正确加载

### 4. 前端无法连接后端

**问题**：`Failed to fetch` 或网络错误

**解决**：
- 检查 `VITE_API_BASE_URL` 是否正确
- 确认后端服务正在运行
- 检查防火墙设置
- 确认 CORS 配置正确

## 📚 相关文档

- `README.md` - 项目说明
- `VM_DEPLOY.md` - 虚拟机部署指南
- `PERMISSION_CONTROL.md` - 权限控制说明
- `DEPLOYMENT_ARCHITECTURE.md` - 部署架构说明
- `HOW_TO_CONNECT.md` - 前后端连接说明

## 🆘 获取帮助

如果遇到问题：
1. 检查日志文件：`backend.log`
2. 查看浏览器控制台错误
3. 检查后端日志输出
4. 参考相关部署文档

## ✨ 最新更新

- ✅ 权限控制：用户只能访问自己的命书
- ✅ 修复起卦界面跳转问题
- ✅ 代码清理和优化
- ✅ 添加虚拟机部署支持

---

**最后更新**: 2025-01-15
