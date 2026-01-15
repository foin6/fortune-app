# 🖥️ 虚拟机部署方案（公司内网）

## 📋 方案解读

### 你的情况：
1. ✅ 有公司内网的虚拟机资源
2. ✅ 有现成的域名可以解析到虚拟机
3. ✅ 需要快速部署，让老板们试玩

### 方案优势：
- ✅ **最快**：直接在虚拟机部署，不需要注册云服务
- ✅ **免费**：使用公司现有资源
- ✅ **简单**：不需要配置复杂的云服务
- ✅ **可控**：完全由你控制

## 🚀 快速部署步骤

### 第一步：准备虚拟机

**需要的信息：**
- 虚拟机的 IP 地址
- SSH 访问权限
- 操作系统（推荐 Ubuntu/Debian 或 CentOS）

### 第二步：在虚拟机上部署

#### 方式 A: 使用 Docker（推荐）⭐

**优点：**
- ✅ 环境隔离
- ✅ 一键部署
- ✅ 易于管理

**步骤：**

1. **在虚拟机上安装 Docker**：
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

2. **创建 Dockerfile**（我会帮你创建）

3. **构建和运行**：
   ```bash
   docker build -t fortune-app .
   docker run -d -p 8000:8000 \
     -e COMPASS_API_KEY=你的key \
     -e ALLOWED_ORIGINS=https://你的域名.com \
     --name fortune-app \
     fortune-app
   ```

#### 方式 B: 直接部署（更简单）

**步骤：**

1. **SSH 连接到虚拟机**：
   ```bash
   ssh user@虚拟机IP
   ```

2. **克隆代码**：
   ```bash
   git clone https://github.com/Judyzj/fortune-app.git
   cd fortune-app
   ```

3. **安装依赖**：
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **配置环境变量**：
   ```bash
   # 创建 .env 文件
   cat > .env << EOF
   COMPASS_API_KEY=你的compass_api_key
   ALLOWED_ORIGINS=https://你的域名.com
   EOF
   ```

5. **启动服务**：
   ```bash
   # 使用 systemd 或 screen/tmux 保持运行
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### 第三步：配置域名解析

**在域名管理后台：**
1. 找到现有的域名
2. 添加或修改 A 记录：
   - **类型**: A
   - **主机**: `@` 或 `api`（如 `api.yourdomain.com`）
   - **值**: 虚拟机的 IP 地址
   - **TTL**: 600（10分钟）

**示例：**
```
api.yourdomain.com  →  192.168.1.100
```

### 第四步：配置 Nginx（可选，推荐）

**如果虚拟机有 Nginx：**

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**重启 Nginx：**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 📦 快速部署脚本

### 一键部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash

# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Python 和依赖
sudo apt install -y python3 python3-pip python3-venv git

# 3. 克隆代码
cd /opt
sudo git clone https://github.com/Judyzj/fortune-app.git
cd fortune-app

# 4. 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 5. 安装依赖
pip install -r requirements.txt

# 6. 创建 .env 文件（需要手动填写）
cat > .env << EOF
COMPASS_API_KEY=你的compass_api_key
ALLOWED_ORIGINS=https://你的域名.com
EOF

# 7. 创建 systemd 服务
sudo tee /etc/systemd/system/fortune-app.service > /dev/null << EOF
[Unit]
Description=Fortune App Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/fortune-app
Environment="PATH=/opt/fortune-app/venv/bin"
ExecStart=/opt/fortune-app/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 8. 启动服务
sudo systemctl daemon-reload
sudo systemctl enable fortune-app
sudo systemctl start fortune-app

# 9. 检查状态
sudo systemctl status fortune-app
```

## 🔧 配置说明

### 环境变量

在虚拟机上创建 `.env` 文件：

```bash
COMPASS_API_KEY=你的compass_api_key
ALLOWED_ORIGINS=https://你的域名.com,https://fortune-app.vercel.app
DEEPSEEK_API_KEY=你的deepseek_api_key（可选）
```

### 防火墙配置

确保虚拟机开放 8000 端口：

```bash
# Ubuntu/Debian
sudo ufw allow 8000/tcp

# CentOS
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

## 🌐 域名配置

### 方案 A: 子域名

```
api.yourdomain.com  →  虚拟机IP:8000
```

### 方案 B: 路径

```
yourdomain.com/api  →  虚拟机IP:8000
```

**推荐使用子域名**（更清晰）

## ✅ 验证部署

1. **检查服务是否运行**：
   ```bash
   curl http://localhost:8000/health
   ```

2. **检查域名解析**：
   ```bash
   curl http://api.yourdomain.com/health
   ```

3. **应该返回**：
   ```json
   {"status": "ok"}
   ```

## 🔗 连接前端

### 在 Vercel 前端环境变量中：

```
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 在后端环境变量中：

```
ALLOWED_ORIGINS=https://fortune-app.vercel.app,https://你的域名.com
```

## 🎯 完整流程

1. ✅ **SSH 连接到虚拟机**
2. ✅ **克隆代码**：`git clone https://github.com/Judyzj/fortune-app.git`
3. ✅ **安装依赖**：`pip install -r requirements.txt`
4. ✅ **配置环境变量**：创建 `.env` 文件
5. ✅ **启动服务**：`uvicorn main:app --host 0.0.0.0 --port 8000`
6. ✅ **配置域名解析**：A 记录指向虚拟机 IP
7. ✅ **更新前端环境变量**：指向新域名
8. ✅ **完成！** 🎉

## 💡 保持服务运行

### 使用 systemd（推荐）

创建服务文件，让服务自动启动和重启。

### 使用 screen/tmux

```bash
screen -S fortune-app
uvicorn main:app --host 0.0.0.0 --port 8000
# 按 Ctrl+A 然后 D 退出，服务继续运行
```

## 🚀 最快方法

**如果虚拟机已经有 Docker：**

```bash
# 1. 克隆代码
git clone https://github.com/Judyzj/fortune-app.git
cd fortune-app

# 2. 构建镜像
docker build -t fortune-app .

# 3. 运行
docker run -d -p 8000:8000 \
  -e COMPASS_API_KEY=你的key \
  -e ALLOWED_ORIGINS=https://你的域名.com \
  --name fortune-app \
  --restart always \
  fortune-app
```

**完成！** 服务会自动启动并在重启后自动运行。

需要我帮你创建 Dockerfile 或部署脚本吗？
