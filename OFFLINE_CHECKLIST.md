# 📋 离线部署检查清单

## 联网环境准备阶段

### 必选项

- [ ] **Node.js >= 18.0.0**
  - 下载地址: https://nodejs.org/download/
  - 验证: `node -v`

- [ ] **项目代码**
  - [ ] 克隆项目代码
  - [ ] npm install 安装依赖
  - [ ] 验证项目可以正常启动: `npm run dev`

### 可选项（根据需求选择）

#### Oracle 支持
- [ ] **Oracle Instant Client**
  - 下载地址: https://www.oracle.com/database/technologies/instant-client/downloads.html
  - 选择正确的系统版本
  - 下载文件示例:
    - Linux: instantclient-basiclite-linux.x64-21.10.0.0.0dbru.zip
    - macOS: instantclient-basiclite-macos.x64-21.10.0.0.0dbru.zip
    - Windows: instantclient-basiclite-windows.x64-21.10.0.0.0dbru.zip

#### AI 支持
- [ ] **Ollama**
  - 下载地址: https://ollama.ai/download
  - 安装 Ollama
  - 下载模型（根据网络情况选择）:
    ```bash
    # 推荐（较小，8GB）
    ollama pull llama3.1:8b
    
    # 备选（更大，14GB）
    ollama pull qwen2.5-coder:14b
    
    # 完整版（72GB，需要网络好）
    ollama pull llama3.1:70b
    ```
  - 验证: `ollama list`

## 打包阶段

### 1. 创建打包目录

```bash
# 创建打包目录
mkdir RAG-offline-deploy
cd RAG-offline-deploy

# 复制项目
cp -r /path/to/RAG- .
cp -r /path/to/node_modules ./RAG-/node_modules
```

### 2. 打包依赖（可选）

如果离线环境的 npm 无法使用：

```bash
# 打包 node_modules
cd RAG-offline-deploy/RAG-
npm pack --pack-destination ../npm-cache
cd ../..

# 打包 Oracle Instant Client（如果需要）
cp /path/to/instantclient*.zip RAG-offline-deploy/tools/
```

### 3. 打包 Ollama 模型（如果需要）

```bash
# 复制模型文件
cp -r ~/.ollama/models RAG-offline-deploy/ollama-models/

# 或者导出模型为文件
ollama save llama3.1:8b ./llama3.1-8b.tar
cp llama3.1-8b.tar RAG-offline-deploy/tools/
```

### 4. 创建打包文件

```bash
# 创建压缩包
tar -czvf RAG-offline-$(date +%Y%m%d).tar.gz RAG-offline-deploy/
```

## 离线环境部署阶段

### 1. 系统要求检查

- [ ] **Node.js >= 18.0.0** 已安装
- [ ] **磁盘空间**: >= 5GB（不含 Oracle 和模型）
- [ ] **内存**: >= 4GB（推荐 8GB+）
- [ ] **CPU**: 4 核+（推荐 8 核+）

验证命令:
```bash
node -v
free -h
df -h .
```

### 2. 解压项目

```bash
# 解压
tar -xzvf RAG-offline-YYYYMMDD.tar.gz

# 进入目录
cd RAG-offline-deploy
```

### 3. 环境配置

#### Oracle Instant Client（如果需要）

**Linux:**
```bash
# 解压
unzip instantclient-basiclite-*.zip -d /opt/oracle/

# 设置环境变量
export LD_LIBRARY_PATH=/opt/oracle/instantclient_21_10:$LD_LIBRARY_PATH
export ORACLE_INSTANT_CLIENT_PATH=/opt/oracle/instantclient_21_10

# 永久配置
echo 'export LD_LIBRARY_PATH=/opt/oracle/instantclient_21_10:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

**macOS:**
```bash
# 解压
unzip instantclient-basiclite-*.zip -d ~/oracle/

# 设置环境变量
export ORACLE_INSTANT_CLIENT_PATH=~/oracle/instantclient_21_10
export LD_LIBRARY_PATH=~/oracle/instantclient_21_10:$LD_LIBRARY_PATH

# 永久配置
echo 'export ORACLE_INSTANT_CLIENT_PATH=~/oracle/instantclient_21_10' >> ~/.zshrc
source ~/.zshrc
```

**Windows:**
```
1. 解压 ZIP 文件到 C:\oracle\instantclient_21_10
2. 添加到系统 PATH:
   - 控制面板 → 系统 → 高级系统设置 → 环境变量
   - 在系统变量中找到 PATH
   - 添加: C:\oracle\instantclient_21_10
3. 重启电脑
```

#### Ollama（如果需要）

**Linux/macOS:**
```bash
# 安装 Ollama（需要通过 U 盘复制安装包）
# 或使用离线安装包

# 设置模型路径
export OLLAMA_MODELS=/path/to/ollama-models/models

# 如果有模型文件，恢复模型
ollama create llama3.1:8b -f ./llama3.1-8b.tar
```

**Windows:**
```powershell
# 安装 Ollama
# 设置环境变量
$env:OLLAMA_MODELS = "C:\path\to\ollama-models\models"

# 恢复模型
ollama create llama3.1:8b -f .\llama3.1-8b.tar
```

### 4. 安装依赖

```bash
# 进入项目目录
cd RAG-offline-deploy/RAG-

# 方式 1: 正常安装（如果 npm 可以访问）
npm install

# 方式 2: 使用缓存（离线）
# 先将 npm-cache 复制到目标机器
npm install --prefer-offline

# 方式 3: 完全离线（如果离线 npm）
# 需要配置 npm 离线源或使用 yarn
yarn install --offline
```

### 5. 验证安装

```bash
# 运行检查脚本
chmod +x check-environment.sh
./check-environment.sh

# 手动验证
ls -la node_modules/.bin/
node -e "console.log('Node.js works!')"
```

## 首次运行配置

### 1. 启动系统

```bash
# 开发模式
npm run dev

# 或生产模式
npm run build
npm start
```

### 2. 访问系统

打开浏览器访问: **http://localhost:5173**

### 3. 配置向导

#### 第一步：Oracle 配置（如果需要）
1. 进入 "数据表管理" 页面
2. 点击 "Oracle 配置"
3. 填写连接信息
4. 测试连接
5. 保存

#### 第二步：AI 配置
1. 进入 "设置" 页面
2. 选择 Ollama 或 OpenAI
3. 填写配置
4. 保存

#### 第三步：导入数据
1. 从 Oracle 加载表结构
2. 编辑表和字段描述
3. 保存

#### 第四步：构建知识库
1. 进入 "知识库" 页面
2. 添加指标知识
3. 添加 SQL 示例

### 4. 测试使用

1. 进入 "智能分析" 页面
2. 输入测试问题
3. 检查结果

## 维护和更新

### 备份

```bash
# 备份数据
tar -czvf RAG-backup-$(date +%Y%m%d).tar.gz \
  data/ \
  .env
```

### 恢复

```bash
# 停止服务
# Ctrl+C

# 解压备份
tar -xzvf RAG-backup-20240101.tar.gz

# 重启
npm run dev
```

### 更新

```bash
# 方式 1: 重新打包部署
# 在联网环境更新代码后重新打包

# 方式 2: 手动更新文件
# 复制更新后的文件到目标环境
```

## 问题排查

### 无法启动

```bash
# 检查端口占用
lsof -i :5173
lsof -i :3001

# 检查日志
npm run dev 2>&1 | tee debug.log

# 检查依赖
npm ls
```

### Oracle 连接失败

```bash
# 检查 Oracle 客户端
ls -la $ORACLE_INSTANT_CLIENT_PATH

# 测试连接
sqlplus username/password@host:1521/sid

# 检查网络
ping host
telnet host 1521
```

### Ollama 不工作

```bash
# 检查服务
ps aux | grep ollama

# 检查端口
lsof -i :11434

# 检查模型
ollama list

# 查看日志
journalctl -u ollama
```

---

## 联系支持

如果遇到无法解决的问题，请收集以下信息：

```bash
# 系统信息
uname -a
node -v
npm -v

# 环境变量
env | grep -E "(ORACLE|OLLAMA|NODE)"

# 错误日志
npm run dev 2>&1

# Oracle 信息（如果适用）
echo $LD_LIBRARY_PATH
ls -la $ORACLE_INSTANT_CLIENT_PATH

# Ollama 信息（如果适用）
ollama list
```

---

**祝部署顺利！🎉**
