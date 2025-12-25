# 🚀 Hướng dẫn chạy nhanh

## Tình trạng hiện tại

✅ **Backend đã được cài đặt và đang chạy tại: http://localhost:8000**

⚠️ **Cần hoàn tất cài đặt:**

### 1. Cài đặt face-recognition (QUAN TRỌNG)

Face-recognition cần cmake và dlib. Trên macOS:

```bash
# Cài đặt Homebrew nếu chưa có
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Cài đặt cmake
brew install cmake

# Cài đặt face-recognition
python3 -m pip install face-recognition
```

**Lưu ý**: Quá trình này có thể mất 5-10 phút vì cần compile dlib.

### 2. Cài đặt Node.js cho Frontend

```bash
# Cài đặt Node.js
brew install node

# Hoặc tải từ: https://nodejs.org/
```

### 3. Cài đặt và chạy Frontend

```bash
# Cài đặt dependencies
npm install

# Chạy frontend
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

## Kiểm tra Backend

Backend đang chạy tại:
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

Bạn có thể mở trình duyệt và truy cập http://localhost:8000/docs để xem API documentation.

## Sử dụng

1. **Truy cập Frontend**: http://localhost:3000 (sau khi cài Node.js và chạy `npm run dev`)
2. **Đăng ký người dùng**: Chụp ảnh và lưu thông tin
3. **Check-in/Check-out**: Sử dụng camera để điểm danh
4. **Dashboard**: Xem báo cáo và xuất dữ liệu

## Khắc phục sự cố

### Backend không chạy:
```bash
# Kiểm tra port 8000
lsof -i :8000

# Khởi động lại
python3 main.py
```

### Lỗi face-recognition:
- Đảm bảo đã cài cmake: `brew install cmake`
- Thử cài dlib trước: `pip3 install dlib`
- Sau đó: `pip3 install face-recognition`

### Lỗi Node.js:
- Cài đặt từ https://nodejs.org/
- Hoặc: `brew install node`

## Dừng server

Nhấn `Ctrl+C` trong terminal đang chạy server.

