# 命理应用后端

## 项目结构

```
fortune_app/
├── main.py                 # FastAPI 应用入口
├── calculator.py           # 八字计算核心模块（使用 lunar-python）
├── models.py              # Pydantic 数据模型
├── requirements.txt       # Python 依赖
├── .env.example           # 环境变量模板
├── .env                   # 环境变量（需要创建，不提交到 Git）
└── fortune_app.db         # SQLite 数据库（自动生成）
```

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置 `DEEPSEEK_API_KEY`：

```
DEEPSEEK_API_KEY=your_actual_api_key_here
```

### 3. 启动服务

```bash
python main.py
```

或使用 uvicorn：

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

服务将在 `http://localhost:8000` 启动。

## 核心依赖

- **FastAPI**: Web 框架
- **Uvicorn**: ASGI 服务器
- **lunar-python**: 八字和阴阳历计算（lunar-java 的 Python 版本）
- **pydantic**: 数据验证和序列化
- **httpx**: 异步 HTTP 客户端（用于调用 DeepSeek API）
- **python-dotenv**: 环境变量管理
- **SQLAlchemy**: ORM 数据库操作

## API 文档

启动服务后，访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 主要接口

- `POST /api/calculate` - 八字排盘计算
- `POST /api/fortune` - 命理分析（流式）
- `POST /api/fortune-books` - 保存命书
- `GET /api/fortune-books/{book_id}` - 获取命书详情
- `GET /api/user/fortune-books` - 获取命书列表
- `DELETE /api/fortune-books/{book_id}` - 删除命书
- `POST /api/generate-kline` - 生成人生 K 线数据
