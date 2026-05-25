#!/bin/bash

################################################################################
# 评估指标智能分析系统 - 离线安装脚本
# 适用于不联网的环境
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示横幅
show_banner() {
    echo ""
    echo "========================================"
    echo "  评估指标智能分析系统 - 离线安装程序"
    echo "========================================"
    echo ""
}

# 检查环境
check_environment() {
    log_info "检查运行环境..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        echo "请先安装 Node.js >= 18.0.0"
        echo "下载地址: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 版本过低，需要 >= 18.0.0"
        log_error "当前版本: $(node -v)"
        exit 1
    fi
    log_success "Node.js 版本: $(node -v)"
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    log_success "npm 版本: $(npm -v)"
    
    # 检查是否离线模式（通过检查 NODE_MODULE_CACHE）
    if [ -n "$npm_config_cache" ] || [ -n "$NPM_CONFIG_CACHE" ]; then
        log_info "检测到离线模式配置"
    fi
}

# 创建目录结构
create_directories() {
    log_info "创建目录结构..."
    
    mkdir -p data
    mkdir -p data/chroma
    mkdir -p data/documents
    mkdir -p data/temp
    
    log_success "目录结构创建完成"
}

# 检查依赖是否已安装
check_dependencies() {
    log_info "检查项目依赖..."
    
    if [ -d "node_modules" ] && [ -f "node_modules/.package-lock.json" ]; then
        log_success "依赖已安装，跳过安装步骤"
        return 0
    else
        log_warning "依赖未安装，需要安装"
        return 1
    fi
}

# 安装依赖（离线模式）
install_dependencies_offline() {
    log_info "安装项目依赖（离线模式）..."
    
    # 尝试使用缓存的依赖
    if npm install --prefer-offline 2>&1 | tee /tmp/npm_install.log; then
        log_success "依赖安装完成"
    else
        log_error "依赖安装失败"
        cat /tmp/npm_install.log
        exit 1
    fi
}

# 安装依赖（在线模式）
install_dependencies_online() {
    log_info "安装项目依赖..."
    
    if npm install 2>&1 | tee /tmp/npm_install.log; then
        log_success "依赖安装完成"
    else
        log_error "依赖安装失败，请检查网络连接"
        cat /tmp/npm_install.log
        exit 1
    fi
}

# 初始化示例数据
init_sample_data() {
    log_info "检查示例数据..."
    
    if [ -f "data/examples.json" ]; then
        log_info "找到示例数据文件"
        
        read -p "是否导入示例数据到系统? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "示例数据可以在系统界面中手动导入"
            log_info "路径: data/examples.json"
        fi
    else
        log_warning "未找到示例数据文件"
    fi
}

# 创建环境配置文件
create_env_config() {
    log_info "配置环境变量..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_success "已创建 .env 配置文件"
            log_info "请根据需要修改配置（Oracle 连接、AI 模型等）"
        fi
    else
        log_success ".env 配置文件已存在"
    fi
}

# 检查 Oracle Instant Client
check_oracle_client() {
    log_info "检查 Oracle Instant Client..."
    
    # 检查常见安装位置
    ORACLE_PATHS=(
        "/usr/lib/oracle/*/client64/lib"
        "/usr/lib/oracle/*/client/lib"
        "/opt/oracle/instantclient*"
        "$HOME/oracle/instantclient*"
    )
    
    FOUND=false
    for path in "${ORACLE_PATHS[@]}"; do
        if ls $path &> /dev/null; then
            log_success "找到 Oracle Instant Client: $path"
            FOUND=true
            break
        fi
    done
    
    if [ "$FOUND" = false ]; then
        log_warning "未找到 Oracle Instant Client"
        log_info "如需连接 Oracle 数据库，请安装 Oracle Instant Client"
        log_info "下载地址: https://www.oracle.com/database/technologies/instant-client/downloads.html"
    fi
}

# 检查 Ollama
check_ollama() {
    log_info "检查 Ollama..."
    
    if command -v ollama &> /dev/null; then
        log_success "Ollama 已安装"
        log_info "可用命令:"
        echo "  - ollama serve      # 启动 Ollama 服务"
        echo "  - ollama list       # 查看已下载模型"
        echo "  - ollama pull <model>  # 下载模型"
        echo ""
        echo "推荐下载模型:"
        echo "  - ollama pull llama3.1"
        echo "  - ollama pull qwen2.5-coder"
    else
        log_warning "Ollama 未安装（可选，但推荐安装以获得更好的 AI 能力）"
        log_info "安装指南: https://ollama.ai/download"
    fi
}

# 验证安装
verify_installation() {
    log_info "验证安装..."
    
    # 检查关键文件
    KEY_FILES=(
        "package.json"
        "src/App.tsx"
        "api/app.ts"
        "api/services/oracleService.ts"
        "api/services/text2sqlService.ts"
    )
    
    for file in "${KEY_FILES[@]}"; do
        if [ -f "$file" ]; then
            log_success "文件存在: $file"
        else
            log_error "文件缺失: $file"
            exit 1
        fi
    done
    
    # 检查 node_modules
    if [ -d "node_modules" ] && [ -d "node_modules/express" ]; then
        log_success "node_modules 安装正确"
    else
        log_error "node_modules 安装不完整"
        exit 1
    fi
}

# 显示完成信息
show_completion() {
    echo ""
    echo "========================================"
    echo "  安装完成！"
    echo "========================================"
    echo ""
    echo "下一步操作："
    echo ""
    echo "1. 配置 Oracle 数据库"
    echo "   - 启动系统: npm run dev"
    echo "   - 访问: http://localhost:5173"
    echo "   - 进入「数据表管理」页面配置 Oracle 连接"
    echo ""
    echo "2. 配置 AI 模型（推荐 Ollama）"
    echo "   - 安装 Ollama: https://ollama.ai/download"
    echo "   - 下载模型: ollama pull llama3.1"
    echo "   - 启动服务: ollama serve"
    echo ""
    echo "3. 导入数据表"
    echo "   - 在「数据表管理」页面导入表结构"
    echo ""
    echo "4. 构建知识库"
    echo "   - 在「知识库」页面添加指标和示例"
    echo ""
    echo "详细文档请查看:"
    echo "  - README.md"
    echo "  - QUICKSTART.md"
    echo "  - OFFLINE_DEPLOYMENT.md"
    echo ""
}

# 主函数
main() {
    show_banner
    
    # 检查环境
    check_environment
    
    # 创建目录
    create_directories
    
    # 检查并安装依赖
    if check_dependencies; then
        log_info "跳过依赖安装（已安装）"
    else
        # 尝试离线安装，失败则尝试在线安装
        if ! install_dependencies_offline; then
            log_warning "离线安装失败，尝试在线安装..."
            install_dependencies_online
        fi
    fi
    
    # 创建环境配置
    create_env_config
    
    # 检查外部依赖
    check_oracle_client
    check_ollama
    
    # 初始化示例数据
    init_sample_data
    
    # 验证安装
    verify_installation
    
    # 显示完成信息
    show_completion
}

# 运行主函数
main "$@"
