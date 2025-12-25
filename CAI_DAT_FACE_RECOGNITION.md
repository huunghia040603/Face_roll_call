# 🔧 Hướng dẫn cài đặt face-recognition

## ⚠️ Vấn đề hiện tại

Python 3.13 quá mới và `dlib` (thư viện cần thiết cho `face-recognition`) chưa có wheel sẵn cho Python 3.13.

## ✅ Giải pháp

### Cách 1: Sử dụng Python 3.11 hoặc 3.12 (Khuyến nghị)

1. **Cài đặt Python 3.12 qua Homebrew:**
   ```bash
   brew install python@3.12
   ```

2. **Tạo virtual environment với Python 3.12:**
   ```bash
   python3.12 -m venv venv312
   source venv312/bin/activate
   ```

3. **Cài đặt dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install face-recognition
   ```

4. **Chạy backend:**
   ```bash
   python main.py
   ```

### Cách 2: Cài đặt dlib từ source (Phức tạp hơn)

1. **Cài đặt dependencies:**
   ```bash
   brew install cmake
   brew install boost
   brew install boost-python3
   ```

2. **Cài đặt dlib:**
   ```bash
   pip3 install dlib --no-binary dlib
   ```

3. **Cài đặt face-recognition:**
   ```bash
   pip3 install face-recognition
   ```

### Cách 3: Sử dụng Conda (Dễ nhất)

1. **Cài đặt Miniconda:**
   ```bash
   brew install miniconda
   ```

2. **Tạo environment:**
   ```bash
   conda create -n face_attendance python=3.11
   conda activate face_attendance
   ```

3. **Cài đặt:**
   ```bash
   conda install -c conda-forge dlib
   pip install face-recognition
   pip install -r requirements.txt
   ```

## 🚀 Giải pháp tạm thời

Tôi đã cài đặt `deepface` và `mediapipe` - có thể sử dụng làm giải pháp thay thế tạm thời. Tuy nhiên, cần chỉnh sửa code để tương thích.

## 📝 Khuyến nghị

**Cách tốt nhất**: Sử dụng Python 3.11 hoặc 3.12 với virtual environment riêng cho dự án này.

