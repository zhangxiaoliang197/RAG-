@echo off
chcp 65001 > nul
echo =========================================
echo 评估指标智能分析系统 - 启动脚本
echo =========================================

REM 检查依赖
if not exist "node_modules" (
    echo 依赖未安装，正在安装...
    call npm install
    if errorlevel 1 (
        echo 依赖安装失败
        exit /b 1
    )
)

REM 创建必要目录
if not exist "data" mkdir data
if not exist "data\chroma" mkdir data\chroma
if not exist "data\documents" mkdir data\documents

echo.
echo =========================================
echo 启动服务...
echo =========================================

REM 启动开发服务器
npm run dev
