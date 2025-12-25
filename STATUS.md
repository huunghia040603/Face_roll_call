# ✅ Trạng thái hệ thống

## Backend Server

✅ **ĐANG CHẠY** tại: **http://localhost:8000**

- API Base URL: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/

Bạn có thể mở trình duyệt và truy cập **http://localhost:8000/docs** để xem và test các API endpoints.

## Frontend

⚠️ **CẦN CÀI ĐẶT NODE.JS**

Để chạy frontend, bạn cần:

1. **Cài đặt Node.js** (nếu chưa có):
   ```bash
   brew install node
   # Hoặc tải từ: https://nodejs.org/
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

3. **Chạy frontend**:
   ```bash
   npm run dev
   ```

Frontend sẽ chạy tại: **http://localhost:3000**

## Face Recognition

⚠️ **CẦN CÀI ĐẶT THÊM**

Để sử dụng tính năng nhận diện khuôn mặt:

```bash
# Cài đặt cmake (nếu chưa có)
brew install cmake

# Cài đặt face-recognition
python3 -m pip install face-recognition
```

**Lưu ý**: Quá trình cài đặt face-recognition có thể mất 5-10 phút.

## Các bước tiếp theo

1. ✅ Backend đã chạy - có thể test API tại http://localhost:8000/docs
2. ⏳ Cài đặt Node.js và chạy frontend
3. ⏳ Cài đặt face-recognition để sử dụng đầy đủ tính năng

## Test API ngay bây giờ

Bạn có thể test API bằng cách:

1. Mở trình duyệt: http://localhost:8000/docs
2. Thử các endpoints:
   - `GET /api/users` - Xem danh sách người dùng
   - `GET /api/attendance` - Xem lịch sử điểm danh

## Dừng Backend

Để dừng backend server, tìm process đang chạy:

```bash
# Tìm process
lsof -i :8000

# Dừng process (thay PID bằng số process)
kill <PID>
```

Hoặc nhấn `Ctrl+C` trong terminal đang chạy backend.

