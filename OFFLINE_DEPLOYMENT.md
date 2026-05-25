# 📦 离线部署指南

## 概述

本指南适用于**无法访问互联网**的开发环境。通过以下步骤，您可以在完全离线的环境中部署和运行评估指标智能分析系统。

## 目录

1. [准备工作](#准备工作)
2. [打包项目（联网环境）](#打包项目联网环境)
3. [部署到离线环境](#部署到离线环境)
4. [配置系统](#配置系统)
5. [故障排除](#故障排除)

---

## 准备工作

### 在联网环境中

在开始之前，您需要在**可以访问互联网的环境**中完成以下准备：

#### 1. 安装 Node.js

下载并安装 Node.js >= 18.0.0：
- Windows: https://nodejs.org/download/
- macOS: `brew install node@18`
- Linux: 使用包管理器安装

#### 2. 下载 Oracle Instant Client（可选）

如果需要连接 Oracle 数据库：
1. 访问 https://www.oracle.com/database/technologies/instant-client/downloads.html
2. 下载适合您系统的版本：
   - **Linux**: instantclient-basiclite-linux.x64-*.zip
   - **macOS**: instantclient-basic-macos.x64-*.zip
   - **Windows**: instantclient-basiclite-windows.x64-*.msi

#### 3. 下载 Ollama 和模型（推荐）

1. 访问 https://ollama.ai/download 下载 Ollama
2. 下载 AI 模型（根据网络情况选择）：
   ```bash
   # 推荐模型（较小，效果好）
   ollama pull llama3.1:8b
   ollama pull qwen2.5-coder:7b
   
   # 备选模型（更大，效果更好）
   ollama pull llama3.1:70b
   ```

---

## 打包项目（联网环境）

### 步骤 1: 克隆项目

```bash
git clone <项目地址>
cd RAG-
```

### 步骤 2: 安装依赖并打包

运行打包脚本：

```bash
# Linux/macOS
chmod +x package-offline.sh
./package-offline.sh

# Windows
package-offline.bat
```

或者手动执行：

```bash
# 1. 安装依赖
npm install

# 2. 打包为离线安装包
npm run build

# 3. 打包项目（排除 node_modules 压缩）
tar -czvf RAG-offline-package.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  .

# 4. 单独打包 node_modules（如果需要）
# 注意：这个包会比较大（通常 200-500MB）
npm pack --pack-destination /tmp
```

### 步骤 3: 组织离线包

创建以下文件结构：

```
RAG-Offline/
├── RAG-/
│   ├── (所有源代码文件)
│   ├── .env.example
│   ├── README.md
│   ├── QUICKSTART.md
│   ├── OFFLINE_DEPLOYMENT.md
│   ├── offline-install.sh
│   └── offline-install.bat
├── node_modules/
│   └── (所有依赖)
├── oracle-instantclient/
│   └── instantclient_19_8/
│       └── (Oracle 客户端文件)
├── ollama-models/
│   └── blobs/
│       └── (AI 模型文件)
└── 部署指南.txt
```

### 步骤 4: 传输到离线环境

使用以下方式之一将打包文件传输到离线环境：
- U 盘
- 移动硬盘
- 局域网传输
- 光盘刻录

---

## 部署到离线环境

### 步骤 1: 检查环境要求

确认离线环境满足以下要求：

| 要求 | 最低版本 | 推荐版本 |
|------|---------|---------|
| Node.js | 18.0.0 | 20.x LTS |
| 内存 | 4GB | 8GB+ |
| 磁盘空间 | 5GB | 10GB+ |
| Oracle Instant Client | 可选 | 已安装 |

### 步骤 2: 运行安装脚本

#### Linux/macOS

```bash
# 1. 解压项目（如果已压缩）
tar -xzvf RAG-offline-package.tar.gz
# 或
unzip RAG-offline-package.zip

# 2. 进入项目目录
cd RAG-

# 3. 添加执行权限
chmod +x offline-install.sh

# 4. 运行安装脚本
./offline-install.sh
```

#### Windows

```cmd
# 1. 解压项目
# 右键点击 ZIP 文件 → "全部解压缩"

# 2. 进入项目目录
cd RAG-

# 3. 运行安装脚本
offline-install.bat
```

### 步骤 3: 配置 Oracle Instant Client（可选）

如果您需要连接 Oracle 数据库：

#### Linux

```bash
# 1. 解压 Oracle Instant Client
unzip instantclient-basiclite-linux.x64-*.zip -d /opt/oracle/

# 2. 设置环境变量
export LD_LIBRARY_PATH=/opt/oracle/instantclient_21_10:$LD_LIBRARY_PATH
export ORACLE_INSTANT_CLIENT_PATH=/opt/oracle/instantclient_21_10

# 3. 或者永久添加到系统
echo 'export LD_LIBRARY_PATH=/opt/oracle/instantclient_21_10:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

#### macOS

```bash
# 1. 解压 Oracle Instant Client
unzip instantclient-basiclite-macos.x64-*.zip -d ~/oracle/

# 2. 设置环境变量
export ORACLE_INSTANT_CLIENT_PATH=~/oracle/instantclient_21_10
export LD_LIBRARY_PATH=~/oracle/instantclient_21_10:$LD_LIBRARY_PATH

# 3. 添加到 shell 配置
echo 'export ORACLE_INSTANT_CLIENT_PATH=~/oracle/instantclient_21_10' >> ~/.zshrc
source ~/.zshrc
```

#### Windows

```cmd
# 1. 安装 Oracle Instant Client
# 运行下载的 MSI 文件，按提示安装

# 2. 添加到系统 PATH
# 控制面板 → 系统 → 高级系统设置 → 环境变量 → PATH
# 添加 Oracle Instant Client 的路径
```

---

## 配置系统

### 启动系统

```bash
# Linux/macOS
npm run dev

# Windows
npm run dev
```

系统启动后，访问：http://localhost:5173

### 配置 Oracle 连接

1. 点击左侧菜单 **"数据表管理"**
2. 点击右上角 **"Oracle 配置"**
3. 填写连接信息：
   - 用户名：Oracle 用户名
   - 密码：Oracle 密码
   - 主机：Oracle 服务器地址
   - 端口：1521（默认）
   - SID：数据库 SID
4. 点击 **"测试连接"** 验证
5. 点击 **"保存"**

### 配置 AI 模型

#### 使用 Ollama（离线 AI）

1. **安装 Ollama**：
   - 将 Ollama 安装包复制到离线环境
   - 安装 Ollama

2. **复制模型文件**：
   ```bash
   # 将联网环境中下载的模型复制到离线环境
   cp -r ~/.ollama/models/* /path/to/offline/ollama-models/
   ```

3. **启动 Ollama 服务**：
   ```bash
   # Linux/macOS
   export OLLAMA_MODELS=/path/to/offline/ollama-models
   ollama serve
   
   # Windows
   set OLLAMA_MODELS=C:\path\to\offline\ollama-models
   ollama serve
   ```

4. **在系统中配置**：
   - 打开系统设置
   - 选择 Ollama 提供商
   - Ollama 地址：`http://localhost:11434`
   - 选择模型

---

## 故障排除

### 问题 1: npm install 失败

**症状**: 离线环境下 npm install 报错

**解决方案**:
```bash
# 清除 npm 缓存
npm cache clean --force

# 重新尝试安装
npm install --prefer-offline

# 如果仍然失败，使用在线模式
npm install --registry=https://registry.npmmirror.com
```

### 问题 2: Oracle 连接失败

**症状**: 无法连接到 Oracle 数据库

**检查项**:
1. Oracle Instant Client 是否正确安装
2. 环境变量是否配置
3. 网络是否可达 Oracle 服务器
4. 防火墙是否开放端口

**解决方案**:
```bash
# 检查 Oracle Instant Client
ls -la /opt/oracle/instantclient*/

# 检查环境变量
echo $LD_LIBRARY_PATH

# 测试 Oracle 连接
sqlplus username/password@host:1521/sid
```

### 问题 3: Ollama 模型无法加载

**症状**: Ollama 服务启动但模型不可用

**解决方案**:
```bash
# 检查模型列表
ollama list

# 手动加载模型（如果复制了模型文件）
export OLLAMA_MODELS=/path/to/your/models
ollama serve

# 或者重新拉取（需要联网）
ollama pull llama3.1
```

### 问题 4: 端口被占用

**症状**: "Port 5173 is already in use"

**解决方案**:
```bash
# Linux/macOS
lsof -i :5173
kill -9 <PID>

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### 问题 5: 内存不足

**症状**: 系统运行缓慢或崩溃

**解决方案**:
```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 或者启动时指定
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

---

## 性能优化

### 建议的系统配置

| 场景 | CPU | 内存 | 磁盘 |
|------|-----|------|------|
| 基础使用 | 4 核 | 8GB | 20GB |
| 中等负载 | 8 核 | 16GB | 50GB |
| 高负载 | 16 核 | 32GB+ | 100GB+ |

### Oracle 优化

1. 确保 Oracle 服务器索引正确
2. 优化 SQL 查询条件
3. 使用分页查询限制结果集

### Ollama 优化

1. 选择合适的模型大小
2. 调整批处理大小
3. 使用 GPU 加速（如可用）

---

## 备份与恢复

### 备份数据

```bash
# 备份所有数据
tar -czvf RAG-backup-$(date +%Y%m%d).tar.gz \
  data/ \
  .env \
  package.json
```

### 恢复数据

```bash
# 停止服务
# Ctrl+C

# 解压备份
tar -xzvf RAG-backup-20240101.tar.gz

# 重启服务
npm run dev
```

---

## 联系方式

如遇到无法解决的问题，请收集以下信息后联系开发团队：

```bash
# 系统信息
uname -a
node -v
npm -v

# 日志
npm run dev 2>&1 | tee debug.log

# Oracle 信息（如适用）
sqlplus -V
```

---

**祝部署成功！🎉**
