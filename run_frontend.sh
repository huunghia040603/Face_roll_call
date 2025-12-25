#!/bin/bash

echo "🚀 Đang khởi động Frontend Server..."

# Kiểm tra Node.js
if ! command -v node &> /dev/null && ! command -v npm &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt"
    echo "📥 Vui lòng cài đặt Node.js từ https://nodejs.org/"
    exit 1
fi

# Kiểm tra dependencies
if [ ! -d "node_modules" ]; then
    echo "📥 Đang cài đặt Node.js packages..."
    npm install
fi

# Khởi động server
echo "✅ Khởi động Frontend tại http://localhost:3000"
echo ""
npm run dev

