#!/bin/bash

# 评估指标智能分析系统 - 启动脚本

echo "========================================="
echo "评估指标智能分析系统 - 启动中"
echo "========================================="

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "⚠️  依赖未安装，正在安装..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

# 创建必要目录
mkdir -p data
mkdir -p data/chroma
mkdir -p data/documents

# 检查 Ollama
if command -v ollama &> /dev/null; then
    echo "✅ Ollama 已安装"
else
    echo "⚠️  提示：未检测到 Ollama，如需使用 AI 功能请先安装"
fi

echo ""
echo "========================================="
echo "启动服务..."
echo "========================================="

# 启动开发服务器
npm run dev
