#!/bin/bash

echo "🔧 Đang cài đặt Python 3.12 và face-recognition..."

# Kiểm tra Homebrew
if ! command -v brew &> /dev/null; then
    echo "📦 Đang cài đặt Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Cài đặt Python 3.12
echo "📦 Đang cài đặt Python 3.12..."
brew install python@3.12

# Tạo virtual environment
echo "🔧 Đang tạo virtual environment với Python 3.12..."
python3.12 -m venv venv312

# Kích hoạt venv
echo "✅ Kích hoạt virtual environment..."
source venv312/bin/activate

# Cài đặt dependencies
echo "📥 Đang cài đặt dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
pip install face-recognition

echo ""
echo "✅ Hoàn tất!"
echo ""
echo "Để sử dụng:"
echo "1. Kích hoạt virtual environment:"
echo "   source venv312/bin/activate"
echo ""
echo "2. Chạy backend:"
echo "   python main.py"
echo ""

