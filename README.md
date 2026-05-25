# 评估指标智能分析系统

## 📖 项目简介

这是一个基于 AI 的**评估指标智能分析系统**，旨在帮助用户通过自然语言查询 Oracle 数据库，生成 SQL 查询语句，并返回分析结果。

### 核心功能

- 🤖 **Text2SQL 智能体** - 使用自然语言生成 SQL 查询
- 📊 **数据表管理** - 从 Oracle 数据库导入和管理表结构
- 🧠 **知识库** - 构建评估指标和 SQL 示例知识库
- 📈 **智能分析** - 自动拆解指标需求并生成分析结果

## 🎯 适用场景

- 数据分析师快速查询数据
- 业务人员自助式数据分析
- 指标体系化管理
- 报表自动化生成

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **Oracle Instant Client**（可选，用于 Oracle 连接）
- **Ollama** 或 **OpenAI API**（可选，用于 AI 能力）

### 在线环境安装

```bash
# 克隆项目
git clone <项目地址>
cd RAG-

# 安装依赖
npm install

# 启动服务
npm run dev
```

访问 http://localhost:5173

### 离线环境安装

详见 [OFFLINE_DEPLOYMENT.md](OFFLINE_DEPLOYMENT.md)

## 📁 项目文档

| 文档 | 说明 |
|------|------|
| [README.md](README.md) | 项目总览 |
| [QUICKSTART.md](QUICKSTART.md) | 5 分钟快速入门 |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | 快速参考卡片 |
| [OFFLINE_DEPLOYMENT.md](OFFLINE_DEPLOYMENT.md) | 离线部署指南 |
| [OFFLINE_CHECKLIST.md](OFFLINE_CHECKLIST.md) | 离线部署检查清单 |
| [PACKAGE.md](PACKAGE.md) | 打包清单 |

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      前端 (React)                           │
│  • 智能指标分析工作台                                       │
│  • 数据表管理界面                                          │
│  • 知识库管理界面                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    后端服务 (Express)                        │
│  • Text2SQL 智能体                                        │
│  • Oracle 数据库连接器                                      │
│  • 知识库检索服务                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      数据层                                 │
│  • Oracle 数据库（业务数据）                                │
│  • ChromaDB（向量数据库）                                  │
│  • JSON 文件（本地配置）                                   │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 功能特性

### 1. 数据表管理

- ✅ 从 Oracle 自动提取表结构
- ✅ 可视化编辑表和字段描述
- ✅ 支持表关系定义
- ✅ 字段类型和约束识别

### 2. 知识库构建

- ✅ 指标定义和分类
- ✅ SQL 示例管理
- ✅ 向量检索
- ✅ 语义匹配

### 3. 智能分析

- ✅ 自然语言理解
- ✅ 指标自动拆解
- ✅ SQL 生成
- ✅ 结果解释
- ✅ 可编辑 SQL

### 4. 查询执行

- ✅ SQL 语法验证
- ✅ Oracle 查询执行
- ✅ 结果表格展示
- ✅ 数据导出

## 🛠️ 技术栈

### 前端
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router

### 后端
- Express.js
- TypeScript
- oracledb（Oracle 驱动）
- ChromaDB（向量数据库）

### AI
- Ollama（本地模型）
- OpenAI API（云端备选）
- sentence-transformers（向量化）

## 📦 使用流程

### 1. 配置 Oracle 连接

1. 打开 "数据表管理" 页面
2. 点击 "Oracle 配置"
3. 填写连接信息
4. 测试并保存

### 2. 导入数据表

1. 点击 "从 Oracle 加载表"
2. 选择要导入的表
3. 编辑表和字段描述
4. 保存

### 3. 构建知识库

**添加指标知识：**
1. 进入 "知识库" 页面
2. 切换到 "指标知识"
3. 添加指标定义

**添加 SQL 示例：**
1. 切换到 "SQL 示例"
2. 添加问题-SQL 映射

### 4. 智能分析

1. 进入 "智能分析" 页面
2. 输入问题，例如：
   - "计算华东区域本月的销售额"
   - "查看各区域的订单数量"
   - "找出购买金额前10名的客户"
3. 点击 "智能分析"
4. 查看生成的 SQL 和结果

## 🔧 脚本说明

| 脚本 | 说明 |
|------|------|
| `install.sh` | 在线安装脚本（macOS/Linux）|
| `install.bat` | 在线安装脚本（Windows）|
| `start.sh` | 一键启动脚本（macOS/Linux）|
| `start.bat` | 一键启动脚本（Windows）|
| `offline-install.sh` | 离线安装脚本 |
| `offline-install.bat` | 离线安装脚本（Windows）|
| `package-offline.sh` | 离线打包脚本（macOS/Linux）|
| `package-offline.bat` | 离线打包脚本（Windows）|
| `check-environment.sh` | 环境检查脚本 |

## ⚙️ 配置说明

### 环境变量

复制 `.env.example` 为 `.env` 并修改：

```env
PORT=3001
VITE_API_BASE_URL=http://localhost:3001/api
CHROMA_DB_PATH=./data/chroma

# Ollama 配置
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1

# OpenAI 配置（备选）
# OPENAI_API_KEY=your-api-key
# OPENAI_MODEL=gpt-4
```

### Oracle 连接

系统支持两种连接方式：

**SID 方式：**
```
host:port:sid
示例: 192.168.1.100:1521:orcl
```

**服务名方式：**
```
host:port/service_name
示例: 192.168.1.100:1521/orcl.example.com
```

## 📊 API 接口

详见 [QUICK_REFERENCE.md](QUICK_REFERENCE.md#关键-api-接口)

## 🔍 故障排除

### 常见问题

**Q: Oracle 连接失败？**
A: 检查网络连接、用户名密码、Oracle 服务状态

**Q: AI 不工作？**
A: 确认 Ollama 已启动，模型已下载，网络连接正常

**Q: 查询超时？**
A: 添加查询条件限制结果集，或优化 SQL

详见：
- [OFFLINE_DEPLOYMENT.md - 故障排除](OFFLINE_DEPLOYMENT.md#故障排除)
- [OFFLINE_CHECKLIST.md](OFFLINE_CHECKLIST.md)

## 📝 开发指南

### 项目结构

```
RAG-/
├── api/                    # 后端代码
│   ├── controllers/        # 控制器
│   ├── routes/           # 路由
│   └── services/         # 服务
├── src/                   # 前端代码
│   ├── pages/           # 页面组件
│   ├── components/      # 公共组件
│   └── services/        # API 服务
├── shared/              # 共享类型
├── data/               # 数据存储
└── ...
```

### 添加新功能

1. 在 `shared/types.ts` 添加类型定义
2. 在 `api/services/` 添加业务逻辑
3. 在 `api/controllers/` 添加控制器
4. 在 `api/routes/` 添加路由
5. 在 `src/services/api.ts` 添加前端 API
6. 在 `src/pages/` 添加页面组件
7. 更新导航（Layout.tsx）

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题，请查看文档或联系开发团队。
