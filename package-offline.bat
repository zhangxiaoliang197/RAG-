@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   评估指标智能分析系统 - 离线打包工具
echo ========================================
echo.

:: 设置变量
set PROJECT_NAME=RAG-
set PACKAGE_NAME=RAG-Offline-Package
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set OUTPUT_DIR=offline-package

:: 检查环境
echo [INFO] 检查打包环境...
where node > nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js 未安装，请先安装 Node.js ^>= 18.0.0
    exit /b 1
)
echo [SUCCESS] Node.js 版本: 
node --version

where npm > nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm 未安装
    exit /b 1
)
echo [SUCCESS] npm 版本: 
npm --version

:: 创建输出目录
echo [INFO] 创建打包目录...
if exist "%OUTPUT_DIR%" rmddir /s /q "%OUTPUT_DIR%"
mkdir "%OUTPUT_DIR%"
mkdir "%OUTPUT_DIR%\%PROJECT_NAME%"
mkdir "%OUTPUT_DIR%\node_modules_cache"

:: 复制项目文件
echo [INFO] 复制项目文件...
xcopy /E /Y /Q * "%OUTPUT_DIR%\%PROJECT_NAME%\" > nul
del /f /q "%OUTPUT_DIR%\%PROJECT_NAME%\node_modules" 2>nul
del /f /q "%OUTPUT_DIR%\%PROJECT_NAME%\.git" 2>nul
echo [SUCCESS] 项目文件复制完成

:: 安装依赖
echo [INFO] 安装项目依赖...
cd "%OUTPUT_DIR%\%PROJECT_NAME%"
call npm install > ..\npm_install.log 2>&1
if errorlevel 1 (
    echo [ERROR] 依赖安装失败
    type ..\npm_install.log
    cd ..\..
    exit /b 1
)
echo [SUCCESS] 依赖安装完成
cd ..\..

:: 复制依赖到缓存
echo [INFO] 打包依赖...
xcopy /E /Y /Q "%OUTPUT_DIR%\%PROJECT_NAME%\node_modules" "%OUTPUT_DIR%\node_modules_cache\" > nul

:: 创建打包清单
echo [INFO] 创建打包清单...
(
echo 评估指标智能分析系统 - 离线部署包
echo ========================================
echo.
echo 打包时间: %TIMESTAMP%
echo Node.js 版本: 
node --version
echo NPM 版本: 
npm --version
echo.
echo 包含内容:
echo ---------
echo 1. 项目源代码（%PROJECT_NAME%/）
echo 2. Node.js 依赖（node_modules_cache/）
echo 3. 离线安装脚本
echo 4. 部署文档
echo.
echo 部署步骤:
echo ---------
echo 1. 解压本包到目标目录
echo 2. 进入 %PROJECT_NAME% 目录
echo 3. 运行离线安装脚本: offline-install.bat
echo 4. 按提示完成配置
echo.
echo 详细文档:
echo ---------
echo - OFFLINE_DEPLOYMENT.md - 完整离线部署指南
echo - QUICKSTART.md - 快速启动指南
echo - README.md - 完整项目文档
) > "%OUTPUT_DIR%\PACKAGE_MANIFEST.txt"

:: 创建部署指南
echo [INFO] 创建部署指南...
(
echo ========================================
echo 评估指标智能分析系统 - 部署指南
echo ========================================
echo.
echo 【第一步】解压文件
echo ----------------
echo 1. 将 ZIP 文件解压到指定目录
echo 2. 进入解压后的文件夹
echo.
echo 【第二步】安装依赖
echo ----------------
echo 双击运行: offline-install.bat
echo 或在命令提示符中运行: offline-install.bat
echo.
echo 【第三步】启动系统
echo ----------------
echo npm run dev
echo.
echo 【第四步】访问系统
echo ----------------
echo 打开浏览器访问: http://localhost:5173
echo.
echo 【第五步】配置系统
echo ----------------
echo 1. 配置 Oracle 数据库（如需要）
echo 2. 配置 AI 模型（如需要）
echo 3. 导入数据表
echo 4. 构建知识库
echo.
echo 详细说明请查看:
echo - OFFLINE_DEPLOYMENT.md（完整离线部署指南）
echo - QUICKSTART.md（快速启动指南）
echo - README.md（完整项目文档）
) > "%OUTPUT_DIR%\部署指南.txt"

:: 创建 ZIP 包
echo [INFO] 创建最终打包文件...
powershell -command "Compress-Archive -Path '%OUTPUT_DIR%\*' -DestinationPath '%PACKAGE_NAME%-%TIMESTAMP%.zip' -Force"

:: 清理临时文件
echo [INFO] 清理临时文件...
rmdir /s /q "%OUTPUT_DIR%"

:: 完成
echo.
echo ========================================
echo   打包完成！
echo ========================================
echo.
echo [SUCCESS] 打包文件: %PACKAGE_NAME%-%TIMESTAMP%.zip
for %%F in ("%PACKAGE_NAME%-%TIMESTAMP%.zip") do echo [INFO] 文件大小: %%~zF bytes
echo.
echo [INFO] 下一步操作:
echo   1. 将打包文件传输到离线环境
echo   2. 解压并运行 offline-install.bat
echo   3. 按提示完成部署
echo.
pause
