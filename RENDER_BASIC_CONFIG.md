# ⚙️ Render 基本配置填写指南

## 📋 配置项说明

### 1. Branch（分支）

**当前显示：** `main`

**填写：**
- ✅ **保持 `main`**（正确）
- 这是你的主分支，包含所有代码

### 2. Region（区域）

**当前显示：** `Virginia (US East)`

**填写：**
- ✅ **可以保持默认**（Virginia 是好的选择）
- 或者选择离你用户最近的区域：
  - `Singapore` - 如果主要用户在亚洲
  - `Frankfurt (EU Central)` - 如果主要用户在欧洲
  - `Virginia (US East)` - 如果主要用户在美国

**建议：**
- 如果主要用户在中国/亚洲，选择 `Singapore`
- 否则保持 `Virginia (US East)`

### 3. Root Directory（根目录）

**当前显示：** 空（placeholder: "e.g. src"）

**填写：**
- ✅ **留空**（不需要填写）
- 你的后端代码在仓库根目录
- 不需要指定子目录

### 4. Build Command（构建命令）

**当前显示：** `$ pip install -r requirements.txt`

**填写：**
- ✅ **保持这个命令**（正确）
- 这会安装所有 Python 依赖

### 5. Start Command（启动命令）⭐ 重要！

**当前显示：** `$ gunicorn your_application.wsgi` ❌ **错误！**

**需要改为：**
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

**原因：**
- `gunicorn` 是 Django 的服务器，你的应用是 FastAPI
- FastAPI 使用 `uvicorn` 作为服务器
- `main:app` 表示 `main.py` 文件中的 `app` 对象
- `--host 0.0.0.0` 允许外部访问
- `--port $PORT` 使用 Render 提供的端口

**⚠️ 这个字段是必填的，必须修改！**

### 6. Instance Type（实例类型）

**填写：**
- ✅ **选择 "Free"**（免费套餐）
- 对于小型应用足够使用

## ✅ 完整配置示例

```
Branch: main
Region: Virginia (US East) (或 Singapore)
Root Directory: [留空]
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Instance Type: Free
```

## 🎯 关键修改

**最重要的修改：**

将 Start Command 从：
```
$ gunicorn your_application.wsgi
```

改为：
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

**注意：**
- 不需要 `$` 符号（Render 会自动处理）
- `main:app` 表示 `main.py` 文件中的 `app` 对象
- `$PORT` 是 Render 自动提供的环境变量

## 📝 下一步

1. **修改 Start Command** 为正确的命令
2. **选择 Instance Type** 为 "Free"
3. **其他配置保持默认或按需调整**
4. **点击 "Create Web Service"** 或 "Save Changes"
5. **等待部署完成**

## ⚠️ 常见错误

### 错误 1: 使用错误的启动命令
```
❌ gunicorn your_application.wsgi  # Django 的命令
✅ uvicorn main:app --host 0.0.0.0 --port $PORT  # FastAPI 的命令
```

### 错误 2: 忘记 $PORT
```
❌ uvicorn main:app --host 0.0.0.0 --port 8000
✅ uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 错误 3: 填写 Root Directory
```
❌ frontend  # 这是前端的目录
✅ [留空]  # 后端在根目录
```

## 🚀 配置完成后

配置完成后，Render 会：
1. 从 GitHub 拉取代码
2. 运行 Build Command 安装依赖
3. 运行 Start Command 启动应用
4. 提供访问 URL

部署成功后，访问：`https://你的服务地址/health` 应该返回 `{"status": "ok"}`
