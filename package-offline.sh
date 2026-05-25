#!/bin/bash

################################################################################
# 评估指标智能分析系统 - 离线打包脚本
# 在联网环境中运行，用于创建离线部署包
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 项目信息
PROJECT_NAME="RAG-"
PACKAGE_NAME="RAG-Offline-Package"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTPUT_DIR="./offline-package"

echo ""
echo "========================================"
echo "  评估指标智能分析系统 - 离线打包工具"
echo "========================================"
echo ""

# 检查环境
log_info "检查打包环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js 未安装，请先安装 Node.js >= 18.0.0"
    exit 1
fi
log_success "Node.js 版本: $(node -v)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    log_error "npm 未安装"
    exit 1
fi
log_success "npm 版本: $(npm -v)"

# 创建输出目录
log_info "创建打包目录..."
mkdir -p "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME"
mkdir -p "$OUTPUT_DIR/node_modules_cache"
mkdir -p "$OUTPUT_DIR/tools"

# 复制项目文件
log_info "复制项目文件..."
rsync -av --exclude='node_modules' \
      --exclude='.git' \
      --exclude='dist' \
      --exclude='*.log' \
      --exclude='.DS_Store' \
      --exclude='offline-package' \
      . "$OUTPUT_DIR/$PROJECT_NAME/"
log_success "项目文件复制完成"

# 安装依赖
log_info "安装项目依赖..."
cd "$OUTPUT_DIR/$PROJECT_NAME"
if npm install 2>&1 | tee ../npm_install.log; then
    log_success "依赖安装完成"
else
    log_error "依赖安装失败"
    cat ../npm_install.log
    exit 1
fi
cd ../..

# 复制依赖到缓存
log_info "打包依赖..."
cp -r "$OUTPUT_DIR/$PROJECT_NAME/node_modules" "$OUTPUT_DIR/node_modules_cache/"

# 创建打包清单
log_info "创建打包清单..."
cat > "$OUTPUT_DIR/PACKAGE_MANIFEST.txt" << EOF
评估指标智能分析系统 - 离线部署包
========================================

打包时间: $TIMESTAMP
Node.js 版本: $(node -v)
NPM 版本: $(npm -v)

包含内容:
---------
1. 项目源代码（$PROJECT_NAME/）
2. Node.js 依赖（node_modules_cache/）
3. 离线安装脚本
4. 部署文档

文件大小:
---------
项目代码: $(du -sh "$OUTPUT_DIR/$PROJECT_NAME" | cut -f1)
依赖包: $(du -sh "$OUTPUT_DIR/node_modules_cache" | cut -f1)
总计: $(du -sh "$OUTPUT_DIR" | cut -f1)

部署步骤:
---------
1. 解压本包到目标目录
2. 进入 $PROJECT_NAME 目录
3. 运行离线安装脚本: ./offline-install.sh
4. 按提示完成配置

详细文档:
---------
- README.md - 完整项目文档
- QUICKSTART.md - 快速启动指南
- OFFLINE_DEPLOYMENT.md - 离线部署指南

注意事项:
---------
1. 确保目标环境已安装 Node.js >= 18.0.0
2. 如需连接 Oracle，需安装 Oracle Instant Client
3. 如需使用 AI 功能，需安装 Ollama 并下载模型

联系支持: 如有问题请查看文档或联系开发团队
EOF

# 创建部署指南
log_info "创建部署指南..."
cat > "$OUTPUT_DIR/部署指南.txt" << 'EOF'
========================================
评估指标智能分析系统 - 部署指南
========================================

【第一步】解压文件
----------------
1. 将 ZIP 文件解压到指定目录
2. 进入解压后的文件夹

【第二步】安装依赖
----------------
Windows:
  双击运行 offline-install.bat
  或打开命令提示符运行: offline-install.bat

Linux/macOS:
  在终端运行: chmod +x offline-install.sh
  然后运行: ./offline-install.sh

【第三步】启动系统
----------------
npm run dev

【第四步】访问系统
----------------
打开浏览器访问: http://localhost:5173

【第五步】配置系统
----------------
1. 配置 Oracle 数据库（如需要）
2. 配置 AI 模型（如需要）
3. 导入数据表
4. 构建知识库

详细说明请查看:
- OFFLINE_DEPLOYMENT.md（完整离线部署指南）
- QUICKSTART.md（快速启动指南）
- README.md（完整项目文档）
EOF

# 打包整个文件夹
log_info "创建最终打包文件..."
cd "$OUTPUT_DIR"
tar -czvf "../${PACKAGE_NAME}-${TIMESTAMP}.tar.gz" *
cd ..

# 清理临时文件
log_info "清理临时文件..."
rm -rf "$OUTPUT_DIR"

# 完成
echo ""
echo "========================================"
echo "  打包完成！"
echo "========================================"
echo ""
log_success "打包文件: ${PACKAGE_NAME}-${TIMESTAMP}.tar.gz"
log_info "文件大小: $(du -sh "${PACKAGE_NAME}-${TIMESTAMP}.tar.gz" | cut -f1)"
echo ""
log_info "下一步操作:"
echo "  1. 将打包文件传输到离线环境"
echo "  2. 解压并运行 offline-install.sh"
echo "  3. 按提示完成部署"
echo ""
