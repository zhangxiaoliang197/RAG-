# 🎯 快速参考卡

## 常用命令

### 安装和启动
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 环境检查
```bash
# 检查环境
./check-environment.sh

# 查看 Node.js 版本
node -v

# 查看 npm 版本
npm -v
```

### Oracle 配置
```bash
# 设置 Oracle 客户端路径
export ORACLE_INSTANT_CLIENT_PATH=/opt/oracle/instantclient_21_10
export LD_LIBRARY_PATH=$ORACLE_INSTANT_CLIENT_PATH:$LD_LIBRARY_PATH
```

### Ollama 操作
```bash
# 启动 Ollama
ollama serve

# 查看已下载模型
ollama list

# 下载模型
ollama pull llama3.1:8b

# 导出模型（用于离线部署）
ollama save llama3.1:8b ./llama3.1.tar

# 导入模型
ollama create llama3.1:8b -f ./llama3.1.tar
```

## 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 | http://localhost:5173 | 主界面 |
| 后端 API | http://localhost:3001 | API 接口 |
| Ollama | http://localhost:11434 | AI 模型服务 |

## 目录结构

```
RAG-/
├── api/                 # 后端代码
│   ├── controllers/   # 控制器
│   ├── routes/        # 路由
│   └── services/      # 服务
├── src/               # 前端代码
│   ├── pages/        # 页面组件
│   ├── components/    # 公共组件
│   └── services/      # API 服务
├── data/              # 数据存储
│   ├── oracle-config.json     # Oracle 配置
│   ├── table-metadata.json    # 表元数据
│   ├── metric-knowledge.json  # 指标知识
│   └── sql-examples.json      # SQL 示例
└── ...
```

## 关键 API 接口

### Oracle 配置
```
POST   /api/oracle/config/test    # 测试连接
POST   /api/oracle/config         # 保存配置
GET    /api/oracle/config          # 获取配置
```

### 数据表
```
GET    /api/oracle/tables          # 获取所有表
POST   /api/oracle/tables          # 添加表
PUT    /api/oracle/tables/:id      # 更新表
DELETE /api/oracle/tables/:id      # 删除表
```

### 知识库
```
GET    /api/knowledge/metrics           # 获取指标
POST   /api/knowledge/metrics           # 添加指标
GET    /api/knowledge/sql-examples      # 获取示例
POST   /api/knowledge/sql-examples      # 添加示例
```

### 智能分析
```
POST   /api/analysis                    # 完整分析
POST   /api/analysis/generate-sql       # 只生成 SQL
POST   /api/analysis/execute-sql       # 执行 SQL
```

## 默认配置

### Oracle
- 端口: 1521
- 连接方式: SID
- 超时: 60 秒
- 连接池: 2-10 个连接

### Ollama
- 地址: http://localhost:11434
- 模型: llama3.1
- 温度: 0.1
- 最大令牌: 1000

### 系统
- 前端端口: 5173
- 后端端口: 3001
- 最大上传: 10MB
- 日志级别: info

## 故障排查

### 前端无法访问后端
```bash
# 检查后端是否运行
curl http://localhost:3001/api/config

# 检查 CORS 配置
# 查看 .env 中的 CORS_ORIGIN
```

### Oracle 连接失败
```bash
# 检查 Oracle 客户端
ls -la $ORACLE_INSTANT_CLIENT_PATH

# 测试连接
sqlplus username/password@host:1521/sid

# 查看详细错误
npm run dev 2>&1 | grep -i oracle
```

### Ollama 不响应
```bash
# 检查 Ollama 服务
curl http://localhost:11434/api/tags

# 重启 Ollama
pkill ollama
ollama serve

# 查看日志
journalctl -u ollama
```

## 环境变量

```bash
# 必需（可选）
PORT=3001                    # 后端端口
VITE_API_BASE_URL=...        # API 地址

# Oracle（运行时配置）
ORACLE_INSTANT_CLIENT_PATH=   # Oracle 客户端路径

# Ollama（运行时配置）
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1

# OpenAI（备选）
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4
```

## 快捷键

| 操作 | 快捷键 |
|------|--------|
| 智能分析 | Enter（在输入框中） |
| 复制 SQL | Ctrl+C（在 SQL 编辑器中）|
| 粘贴 | Ctrl+V |
| 全选 | Ctrl+A |
| 刷新页面 | F5 |

## 支持和反馈

- 📖 完整文档: [README.md](README.md)
- 🚀 快速入门: [QUICKSTART.md](QUICKSTART.md)
- 📦 离线部署: [OFFLINE_DEPLOYMENT.md](OFFLINE_DEPLOYMENT.md)
- 📋 部署清单: [OFFLINE_CHECKLIST.md](OFFLINE_CHECKLIST.md)
