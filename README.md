# Hệ thống điểm danh thông minh bằng khuôn mặt

Hệ thống điểm danh tự động sử dụng công nghệ nhận diện khuôn mặt, giúp quản lý chuyên cần một cách khoa học và minh bạch trong môi trường giáo dục.

## Tính năng chính

- 📝 **Đăng ký người dùng**: Chụp ảnh và lưu trữ đặc trưng khuôn mặt vào cơ sở dữ liệu
- ✅ **Check-in**: Nhận diện khuôn mặt và ghi nhận thời gian vào lớp
- 🚪 **Check-out**: Nhận diện khuôn mặt và ghi nhận thời gian ra về
- 📊 **Dashboard**: Xem lịch sử điểm danh, quản lý người dùng
- 📈 **Báo cáo tháng**: Tổng hợp dữ liệu điểm danh theo tháng
- 📥 **Xuất báo cáo**: Xuất dữ liệu ra file Excel hoặc CSV

## Công nghệ sử dụng

### Backend
- **FastAPI**: Framework web hiện đại cho Python
- **SQLAlchemy**: ORM cho quản lý database
- **face_recognition**: Thư viện nhận diện khuôn mặt
- **OpenCV**: Xử lý hình ảnh
- **SQLite**: Database (có thể chuyển sang PostgreSQL)

### Frontend
- **React**: Framework UI
- **Vite**: Build tool
- **Axios**: HTTP client

## Yêu cầu hệ thống

- Python 3.8+
- Node.js 16+
- npm hoặc yarn
- Webcam/Camera

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd Face_roll_call
```

### 2. Cài đặt Backend

```bash
# Tạo virtual environment (khuyến nghị)
python -m venv venv

# Kích hoạt virtual environment
# Trên Windows:
venv\Scripts\activate
# Trên macOS/Linux:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

**Lưu ý**: Thư viện `face_recognition` yêu cầu `dlib`, có thể cần cài đặt thêm:

```bash
# Trên macOS
brew install cmake
pip install dlib

# Trên Ubuntu/Debian
sudo apt-get install cmake
pip install dlib
```

### 3. Cài đặt Frontend

```bash
# Cài đặt dependencies
npm install
```

## Chạy ứng dụng

### 1. Khởi động Backend

```bash
# Đảm bảo đã kích hoạt virtual environment
python main.py

# Hoặc sử dụng uvicorn trực tiếp
uvicorn main:app --reload --port 8000
```

Backend sẽ chạy tại: `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

### 2. Khởi động Frontend

Mở terminal mới:

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

## Sử dụng

### Đăng ký người dùng mới

1. Truy cập trang "Đăng ký"
2. Điền thông tin: Họ tên, Mã sinh viên, Email (tùy chọn)
3. Nhấn "Bật Camera" và cho phép truy cập webcam
4. Đảm bảo khuôn mặt rõ ràng trong khung hình
5. Nhấn "Đăng ký" để lưu thông tin

### Check-in (Điểm danh vào)

1. Truy cập trang "Check-in"
2. Nhấn "Bật Camera"
3. Đưa khuôn mặt vào khung hình
4. Nhấn nút "Check-in"
5. Hệ thống sẽ nhận diện và ghi nhận thời gian vào

### Check-out (Điểm danh ra)

1. Truy cập trang "Check-out"
2. Nhấn "Bật Camera"
3. Đưa khuôn mặt vào khung hình
4. Nhấn nút "Check-out"
5. Hệ thống sẽ nhận diện và ghi nhận thời gian ra

### Dashboard

1. Truy cập trang "Dashboard"
2. Xem lịch sử điểm danh với các bộ lọc
3. Xem danh sách người dùng
4. Xem báo cáo tháng
5. Xuất báo cáo ra Excel/CSV

## Cấu trúc dự án

```
Face_roll_call/
├── main.py                 # FastAPI application
├── database.py             # Database models và configuration
├── face_recognition_service.py  # Service nhận diện khuôn mặt
├── requirements.txt        # Python dependencies
├── package.json           # Node.js dependencies
├── vite.config.js         # Vite configuration
├── index.html             # HTML entry point
├── src/
│   ├── main.jsx           # React entry point
│   ├── App.jsx            # Main App component
│   ├── App.css            # App styles
│   ├── index.css          # Global styles
│   └── components/
│       ├── Register.jsx   # Component đăng ký
│       ├── CheckIn.jsx    # Component check-in
│       ├── CheckOut.jsx   # Component check-out
│       └── Dashboard.jsx  # Component dashboard
├── known_faces/           # Thư mục lưu face encodings (tự động tạo)
└── attendance.db          # SQLite database (tự động tạo)
```

## API Endpoints

- `POST /api/register` - Đăng ký người dùng mới
- `POST /api/check-in` - Check-in
- `POST /api/check-out` - Check-out
- `GET /api/users` - Lấy danh sách người dùng
- `GET /api/attendance` - Lấy lịch sử điểm danh
- `GET /api/attendance/monthly-report` - Báo cáo tháng
- `GET /api/attendance/export` - Xuất báo cáo
- `DELETE /api/users/{student_id}` - Xóa người dùng

## Lưu ý

1. **Bảo mật**: Trong môi trường production, nên:
   - Thêm authentication/authorization
   - Sử dụng HTTPS
   - Cấu hình CORS đúng cách
   - Sử dụng database production (PostgreSQL)

2. **Hiệu năng**: 
   - Face recognition có thể chậm trên CPU, nên sử dụng GPU nếu có
   - Có thể cache face encodings trong memory để tăng tốc

3. **Độ chính xác**:
   - Đảm bảo ánh sáng đủ khi chụp ảnh
   - Khuôn mặt phải rõ ràng, không bị che khuất
   - Có thể điều chỉnh tolerance trong `face_recognition_service.py`

## Troubleshooting

### Lỗi khi cài đặt dlib

```bash
# macOS
brew install cmake
pip install dlib

# Ubuntu
sudo apt-get update
sudo apt-get install build-essential cmake
sudo apt-get install libopenblas-dev liblapack-dev
pip install dlib
```

### Lỗi camera không hoạt động

- Kiểm tra quyền truy cập camera trong trình duyệt
- Đảm bảo không có ứng dụng khác đang sử dụng camera
- Thử trên trình duyệt khác

### Lỗi nhận diện không chính xác

- Đảm bảo ánh sáng đủ
- Khuôn mặt phải rõ ràng, không bị che khuất
- Thử điều chỉnh tolerance trong code

## License

MIT License

## Tác giả

Hệ thống điểm danh thông minh bằng khuôn mặt

