#!/bin/bash

################################################################################
# 环境检查脚本
# 用于验证离线部署环境是否满足要求
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 统计
PASS=0
FAIL=0
WARN=0

# 检查函数
check_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
    ((PASS++))
}

check_fail() {
    echo -e "  ${RED}✗${NC} $1"
    ((FAIL++))
}

check_warn() {
    echo -e "  ${YELLOW}!${NC} $1"
    ((WARN++))
}

# 标题
echo ""
echo "========================================"
echo "  评估指标智能分析系统 - 环境检查"
echo "========================================"
echo ""

# 检查 Node.js
echo "1. Node.js 环境"
echo "----------------------------------------"
if command -v node &> /dev/null; then
    NODE_VER=$(node -v)
    NODE_NUM=$(echo $NODE_VER | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_NUM" -ge 18 ]; then
        check_pass "Node.js 已安装: $NODE_VER"
    else
        check_fail "Node.js 版本过低: $NODE_VER（需要 >= 18.0.0）"
    fi
else
    check_fail "Node.js 未安装"
fi

# 检查 npm
echo ""
echo "2. npm 环境"
echo "----------------------------------------"
if command -v npm &> /dev/null; then
    NPM_VER=$(npm -v)
    check_pass "npm 已安装: v$NPM_VER"
else
    check_fail "npm 未安装"
fi

# 检查磁盘空间
echo ""
echo "3. 磁盘空间"
echo "----------------------------------------"
if command -v df &> /dev/null; then
    FREE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
    if [ $(df . | awk 'NR==2 {print $4}') -gt 5000000 ]; then
        check_pass "磁盘空间充足: $FREE_SPACE 可用"
    else
        check_warn "磁盘空间可能不足: $FREE_SPACE 可用"
    fi
fi

# 检查内存
echo ""
echo "4. 系统内存"
echo "----------------------------------------"
if command -v free &> /dev/null; then
    TOTAL_MEM=$(free -h | awk 'NR==2 {print $2}')
    check_pass "总内存: $TOTAL_MEM"
elif command -v sysctl &> /dev/null; then
    TOTAL_MEM=$(sysctl -n hw.memsize 2>/dev/null | awk '{printf "%.1f GB", $1/1024/1024/1024}')
    check_pass "总内存: $TOTAL_MEM"
fi

# 检查项目文件
echo ""
echo "5. 项目文件"
echo "----------------------------------------"
FILES=(
    "package.json"
    "src/App.tsx"
    "api/app.ts"
    "api/services/oracleService.ts"
    "api/services/text2sqlService.ts"
    "src/services/api.ts"
    "shared/types.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "文件存在: $file"
    else
        check_fail "文件缺失: $file"
    fi
done

# 检查 node_modules
echo ""
echo "6. 依赖包"
echo "----------------------------------------"
if [ -d "node_modules" ]; then
    if [ -d "node_modules/express" ]; then
        check_pass "依赖已安装（node_modules）"
    else
        check_fail "node_modules 存在但不完整"
    fi
else
    check_warn "node_modules 不存在，需要运行 npm install"
fi

# 检查 Oracle Instant Client
echo ""
echo "7. Oracle Instant Client"
echo "----------------------------------------"
ORACLE_FOUND=false

if [ -n "$ORACLE_INSTANT_CLIENT_PATH" ]; then
    check_pass "环境变量已设置: ORACLE_INSTANT_CLIENT_PATH=$ORACLE_INSTANT_CLIENT_PATH"
    ORACLE_FOUND=true
fi

ORACLE_PATHS=(
    "/usr/lib/oracle/*/client64/lib"
    "/usr/lib/oracle/*/client/lib"
    "/opt/oracle/instantclient*"
    "$HOME/oracle/instantclient*"
)

for path in "${ORACLE_PATHS[@]}"; do
    if ls $path &> /dev/null 2>&1; then
        check_pass "找到 Oracle 客户端: $path"
        ORACLE_FOUND=true
        break
    fi
done

if [ "$ORACLE_FOUND" = false ]; then
    check_warn "Oracle Instant Client 未安装（可选）"
fi

# 检查 Ollama
echo ""
echo "8. Ollama"
echo "----------------------------------------"
if command -v ollama &> /dev/null; then
    OLLAMA_VER=$(ollama --version 2>&1 || echo "未知")
    check_pass "Ollama 已安装: $OLLAMA_VER"
    
    # 检查模型
    if ollama list &> /dev/null 2>&1; then
        MODEL_COUNT=$(ollama list 2>/dev/null | tail -n +2 | wc -l | tr -d ' ')
        if [ "$MODEL_COUNT" -gt 0 ]; then
            check_pass "已下载模型数量: $MODEL_COUNT"
        else
            check_warn "未下载任何模型"
        fi
    fi
else
    check_warn "Ollama 未安装（可选，但推荐安装）"
fi

# 检查端口占用
echo ""
echo "9. 端口检查"
echo "----------------------------------------"
if command -v lsof &> /dev/null; then
    if ! lsof -i :5173 &> /dev/null; then
        check_pass "端口 5173 可用（前端）"
    else
        check_warn "端口 5173 已被占用（前端）"
    fi
    
    if ! lsof -i :3001 &> /dev/null; then
        check_pass "端口 3001 可用（后端）"
    else
        check_warn "端口 3001 已被占用（后端）"
    fi
    
    if ! lsof -i :11434 &> /dev/null; then
        check_pass "端口 11434 可用（Ollama）"
    else
        check_warn "端口 11434 已被占用（Ollama）"
    fi
fi

# 网络检查（如果是部分离线环境）
echo ""
echo "10. 网络连接"
echo "----------------------------------------"
if command -v curl &> /dev/null; then
    if curl -s --connect-timeout 3 https://registry.npmjs.org > /dev/null 2>&1; then
        check_pass "可以访问 npm 仓库（部分离线环境）"
    else
        check_pass "离线环境（无法访问外部网络）"
    fi
fi

# 显示总结
echo ""
echo "========================================"
echo "  检查总结"
echo "========================================"
echo ""
echo -e "  ${GREEN}通过: $PASS${NC}"
echo -e "  ${RED}失败: $FAIL${NC}"
echo -e "  ${YELLOW}警告: $WARN${NC}"
echo ""

if [ $FAIL -gt 0 ]; then
    echo -e "${RED}环境检查未通过，请修复失败项后重试${NC}"
    exit 1
elif [ $WARN -gt 0 ]; then
    echo -e "${YELLOW}环境检查通过，但有一些警告（可选组件未安装）${NC}"
    exit 0
else
    echo -e "${GREEN}环境检查全部通过！${NC}"
    exit 0
fi
