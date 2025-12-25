#!/bin/bash

# Script khởi động hệ thống

echo "🚀 Đang khởi động hệ thống điểm danh bằng khuôn mặt..."

# Kiểm tra Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 chưa được cài đặt"
    exit 1
fi

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt"
    exit 1
fi

# Kiểm tra virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Đang tạo virtual environment..."
    python3 -m venv venv
fi

# Kích hoạt virtual environment
echo "🔧 Kích hoạt virtual environment..."
source venv/bin/activate

# Kiểm tra và cài đặt Python dependencies
if [ ! -f "venv/.installed" ]; then
    echo "📥 Đang cài đặt Python dependencies..."
    pip install -r requirements.txt
    touch venv/.installed
fi

# Kiểm tra và cài đặt Node dependencies
if [ ! -d "node_modules" ]; then
    echo "📥 Đang cài đặt Node.js dependencies..."
    npm install
fi

# Tạo thư mục cần thiết
mkdir -p known_faces

echo "✅ Khởi động Backend..."
python main.py &
BACKEND_PID=$!

# Đợi backend khởi động
sleep 3

echo "✅ Khởi động Frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Hệ thống đã khởi động!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Nhấn Ctrl+C để dừng hệ thống"

# Chờ tín hiệu dừng
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait

