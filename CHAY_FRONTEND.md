# 🚀 Hướng dẫn chạy Frontend

## ✅ Backend đã chạy thành công!

Backend của bạn đang chạy tại: **http://localhost:8000**

Bạn có thể xem API documentation tại: **http://localhost:8000/docs**

## 📱 Để chạy Frontend (Giao diện Web)

### Bước 1: Cài đặt Node.js

**Cách 1: Dùng Homebrew (Khuyến nghị)**
```bash
# Cài đặt Homebrew nếu chưa có
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Cài đặt Node.js
brew install node
```

**Cách 2: Tải từ trang chính thức**
- Truy cập: https://nodejs.org/
- Tải và cài đặt phiên bản LTS (Long Term Support)

### Bước 2: Kiểm tra cài đặt
```bash
node --version
npm --version
```

### Bước 3: Cài đặt dependencies và chạy Frontend
```bash
cd /Users/huunghiakhach/Documents/Face_roll_call

# Cài đặt các package cần thiết
npm install

# Chạy frontend
npm run dev
```

### Bước 4: Truy cập giao diện web
Sau khi chạy `npm run dev`, frontend sẽ tự động mở tại:
- **http://localhost:3000**

## 🎯 Sử dụng hệ thống

1. **Đăng ký**: Chụp ảnh và đăng ký người dùng mới
2. **Check-in**: Điểm danh vào lớp bằng khuôn mặt
3. **Check-out**: Điểm danh ra về bằng khuôn mặt  
4. **Dashboard**: Xem báo cáo và xuất dữ liệu

## ⚠️ Lưu ý

Để sử dụng tính năng nhận diện khuôn mặt, bạn cần cài đặt thêm:
```bash
brew install cmake
python3 -m pip install face-recognition
```

## 🔧 Khắc phục sự cố

### Lỗi "node: command not found"
- Đảm bảo đã cài đặt Node.js
- Khởi động lại terminal sau khi cài đặt
- Kiểm tra PATH: `echo $PATH`

### Lỗi khi chạy npm install
- Xóa thư mục `node_modules` và file `package-lock.json`
- Chạy lại: `npm install`

### Port 3000 đã được sử dụng
- Đổi port trong `vite.config.js` hoặc
- Dừng ứng dụng đang dùng port 3000

