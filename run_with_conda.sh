#!/bin/bash

# Script chạy backend với Conda environment

echo "🚀 Đang khởi động Backend với Conda environment..."

# Kích hoạt conda
source $HOME/miniconda3/etc/profile.d/conda.sh

# Kích hoạt environment
conda activate face_attendance

# Tạo thư mục cần thiết
mkdir -p known_faces

# Kiểm tra face-recognition
python -c "import face_recognition" 2>/dev/null || {
    echo "❌ face-recognition chưa được cài đặt"
    echo "📥 Đang cài đặt..."
    pip install face-recognition
}

# Khởi động server
echo "✅ Khởi động Backend tại http://localhost:8000"
echo "📚 API Docs tại http://localhost:8000/docs"
echo ""
python main.py

