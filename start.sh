#!/bin/bash

echo "🚀 启动租房谈判助手"
echo "===================="

# 检查是否存在.env文件
if [ ! -f "backend/.env" ]; then
    echo "⚠️  警告：未找到 backend/.env 文件"
    echo "请复制 backend/.env.example 到 backend/.env 并配置您的API密钥"
    exit 1
fi

# 启动后端
echo "📦 启动后端服务..."
cd backend
python -m venv venv 2>/dev/null || true
source venv/bin/activate || source venv/Scripts/activate  # Windows兼容
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8088 &
BACKEND_PID=$!

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 5

# 启动前端（在新终端窗口）
echo "🌐 准备启动前端服务..."
cd ../frontend

# 检查是否需要安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

echo "✅ 前端和后端已启动！"
echo ""
echo "🌐 前端地址: http://localhost:3088"
echo "🔗 后端API: http://localhost:8088"
echo "📚 API文档: http://localhost:8088/docs"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 启动前端
npm start

# 清理函数
cleanup() {
    echo "🛑 正在停止服务..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# 等待前端进程结束
wait