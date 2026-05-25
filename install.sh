#!/bin/bash

# 评估指标智能分析系统 - 快速启动脚本

echo "========================================="
echo "评估指标智能分析系统 - 安装脚本"
echo "========================================="

# 检查 Node.js
echo ""
echo "[1/5] 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本过低，需要 >= 18.0.0"
    exit 1
fi
echo "✅ Node.js 版本: $(node -v)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi
echo "✅ npm 版本: $(npm -v)"

# 安装依赖
echo ""
echo "[2/5] 安装项目依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi
echo "✅ 依赖安装完成"

# 创建数据目录
echo ""
echo "[3/5] 初始化数据目录..."
mkdir -p data
mkdir -p data/chroma
mkdir -p data/documents
echo "✅ 数据目录创建完成"

# 检查示例数据
if [ ! -f "data/examples.json" ]; then
    echo "⚠️  未找到示例数据文件"
fi

# 配置环境变量
echo ""
echo "[4/5] 配置环境变量..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ 已创建 .env 文件，请根据需要修改配置"
    else
        echo "⚠️  未找到 .env.example 文件"
    fi
else
    echo "✅ .env 文件已存在"
fi

# 检查 Ollama（可选）
echo ""
echo "[5/5] 检查 Ollama（可选）..."
if command -v ollama &> /dev/null; then
    echo "✅ Ollama 已安装"
    echo "   启动命令: ollama serve"
    echo "   下载模型: ollama pull llama3.1"
else
    echo "⚠️  Ollama 未安装（可选，但推荐安装以获得更好的 AI 能力）"
    echo "   安装指南: https://ollama.ai/download"
fi

# 完成
echo ""
echo "========================================="
echo "安装完成！"
echo "========================================="
echo ""
echo "下一步："
echo "1. 配置 Oracle 数据库连接（在系统设置页面）"
echo "2. 配置 LLM（推荐 Ollama）"
echo "3. 添加数据表和知识库"
echo "4. 启动系统: npm run dev"
echo ""
echo "访问地址: http://localhost:5173"
echo ""
echo "详细文档请查看 README.md"
echo ""
