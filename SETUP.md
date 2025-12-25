# Hướng dẫn cài đặt và chạy dự án

## Bước 1: Cài đặt dependencies hệ thống

### macOS:
```bash
# Cài đặt Homebrew nếu chưa có
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Cài đặt cmake (cần cho face-recognition)
brew install cmake

# Cài đặt Node.js (nếu chưa có)
brew install node
```

## Bước 2: Cài đặt Python packages

```bash
cd /Users/huunghiakhach/Documents/Face_roll_call

# Cài đặt các packages cơ bản (đã cài xong)
# Cài đặt face-recognition (cần cmake)
python3 -m pip install face-recognition
```

**Lưu ý**: Nếu gặp lỗi khi cài face-recognition, thử:
```bash
# Cài đặt dlib trước
python3 -m pip install dlib
# Sau đó cài face-recognition
python3 -m pip install face-recognition
```

## Bước 3: Cài đặt Node.js packages

```bash
npm install
```

## Bước 4: Chạy ứng dụng

### Terminal 1 - Backend:
```bash
./run_backend.sh
# Hoặc
python3 main.py
```

### Terminal 2 - Frontend:
```bash
./run_frontend.sh
# Hoặc
npm run dev
```

## Truy cập ứng dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Khắc phục sự cố

### Lỗi face-recognition:
- Đảm bảo đã cài cmake: `brew install cmake`
- Thử cài dlib trước: `pip3 install dlib`
- Trên macOS Apple Silicon, có thể cần: `pip3 install --upgrade pip setuptools wheel`

### Lỗi Node.js:
- Cài đặt từ https://nodejs.org/
- Hoặc dùng Homebrew: `brew install node`

### Lỗi camera:
- Cho phép trình duyệt truy cập camera
- Kiểm tra không có ứng dụng khác đang dùng camera

