# ⚡ Giải pháp nhanh cho lỗi face-recognition

## 🔴 Vấn đề
Python 3.13 quá mới, `dlib` (cần cho face-recognition) chưa hỗ trợ.

## ✅ Giải pháp nhanh nhất

### Cách 1: Sử dụng Python 3.12 (Khuyến nghị - 5 phút)

Chạy script tự động:
```bash
./fix_face_recognition.sh
```

Hoặc làm thủ công:
```bash
# 1. Cài Python 3.12
brew install python@3.12

# 2. Tạo venv mới
python3.12 -m venv venv312
source venv312/bin/activate

# 3. Cài đặt
pip install -r requirements.txt
pip install face-recognition

# 4. Chạy backend
python main.py
```

### Cách 2: Sử dụng Conda (Dễ nhất - 3 phút)

```bash
# Cài Miniconda (nếu chưa có)
brew install miniconda

# Tạo environment
conda create -n face_attendance python=3.11 -y
conda activate face_attendance

# Cài đặt
conda install -c conda-forge dlib -y
pip install face-recognition
pip install -r requirements.txt

# Chạy
python main.py
```

## 🎯 Sau khi cài đặt

1. **Kích hoạt environment:**
   - Với venv: `source venv312/bin/activate`
   - Với conda: `conda activate face_attendance`

2. **Chạy backend:**
   ```bash
   python main.py
   ```

3. **Truy cập:**
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs

## ⚠️ Lưu ý

- Backend hiện tại đang chạy với Python 3.13 (không có face-recognition)
- Sau khi cài Python 3.12 và face-recognition, cần restart backend
- Dừng backend hiện tại: `lsof -ti:8000 | xargs kill`

## 🚀 Quick Start

```bash
# Chạy script tự động
./fix_face_recognition.sh

# Sau đó
source venv312/bin/activate
python main.py
```

