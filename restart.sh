#!/bin/bash

echo "🔄 重启租房谈判助手服务"
echo "========================"

# 查找并杀死现有进程
echo "🛑 停止现有服务..."

# 杀死Python/uvicorn进程
pkill -f "uvicorn.*main:app" 2>/dev/null
pkill -f "python.*main.py" 2>/dev/null

# 杀死Node.js/React进程
pkill -f "react-scripts start" 2>/dev/null
pkill -f "node.*react-scripts" 2>/dev/null

# 等待进程完全退出
sleep 2

echo "✅ 已停止现有服务"

# 启动新服务
echo "🚀 启动新服务..."
./start.sh