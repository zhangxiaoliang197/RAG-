@echo off
chcp 65001 > nul
echo =========================================
echo 评估指标智能分析系统 - 安装脚本
echo =========================================

echo.
echo [1/5] 检查环境...
node --version > nul 2>&1
if errorlevel 1 (
    echo Node.js 未安装，请先安装 Node.js ^>= 18.0.0
    exit /b 1
)
echo 已安装 Node.js
echo.

echo [2/5] 安装项目依赖...
call npm install
if errorlevel 1 (
    echo 依赖安装失败
    exit /b 1
)
echo 依赖安装完成
echo.

echo [3/5] 初始化数据目录...
if not exist "data" mkdir data
if not exist "data\chroma" mkdir data\chroma
if not exist "data\documents" mkdir data\documents
echo 数据目录创建完成
echo.

echo [4/5] 配置环境变量...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo 已创建 .env 文件，请根据需要修改配置
    )
)
echo.

echo [5/5] 检查 Ollama（可选）...
where ollama > nul 2>&1
if not errorlevel 1 (
    echo Ollama 已安装
    echo 启动命令: ollama serve
    echo 下载模型: ollama pull llama3.1
) else (
    echo Ollama 未安装（可选，但推荐安装以获得更好的 AI 能力）
    echo 安装指南: https://ollama.ai/download
)

echo.
echo =========================================
echo 安装完成！
echo =========================================
echo.
echo 下一步：
echo 1. 配置 Oracle 数据库连接（在系统设置页面）
echo 2. 配置 LLM（推荐 Ollama）
echo 3. 添加数据表和知识库
echo 4. 启动系统: npm run dev
echo.
echo 访问地址: http://localhost:5173
echo.
echo 详细文档请查看 README.md
echo.
pause
