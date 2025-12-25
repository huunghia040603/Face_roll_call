#!/bin/bash

echo "🚀 Đang khởi động Backend Server..."

# Kiểm tra Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 chưa được cài đặt"
    exit 1
fi

# Kiểm tra packages
echo "📦 Kiểm tra dependencies..."
python3 -c "import fastapi" 2>/dev/null || {
    echo "📥 Đang cài đặt Python packages..."
    python3 -m pip install -r requirements.txt
}

# Tạo thư mục cần thiết
mkdir -p known_faces

# Khởi động server
echo "✅ Khởi động Backend tại http://localhost:8000"
echo "📚 API Docs tại http://localhost:8000/docs"
echo ""
python3 main.py

