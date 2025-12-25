from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, date, timedelta
from typing import Optional, List
import os
import pandas as pd
from io import BytesIO
import base64

from database import init_db, get_db, User, AttendanceRecord
from face_recognition_service import face_service

app = FastAPI(title="Face Recognition Attendance System", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()


@app.get("/")
async def root():
    return {"message": "Face Recognition Attendance System API"}


@app.post("/api/register")
async def register_user(
    name: str = Form(...),
    student_id: str = Form(...),
    email: Optional[str] = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Đăng ký người dùng mới với ảnh khuôn mặt"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.student_id == student_id).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Student ID already exists")
        
        # Read image data
        image_data = await image.read()
        
        # Kiểm tra kích thước file
        if len(image_data) < 1000:
            raise HTTPException(status_code=400, detail="Image file is too small. Please provide a valid image.")
        
        # Encode face
        face_encoding = face_service.encode_face_from_image(image_data)
        if face_encoding is None:
            raise HTTPException(
                status_code=400, 
                detail="Không phát hiện được khuôn mặt trong ảnh. Vui lòng:\n"
                       "- Đảm bảo khuôn mặt rõ ràng và đầy đủ trong khung hình\n"
                       "- Ánh sáng đủ sáng\n"
                       "- Không bị che khuất (khẩu trang, kính râm, v.v.)\n"
                       "- Chụp lại với góc nhìn thẳng"
            )
        
        # Save face encoding
        encoding_path = f"known_faces/{student_id}.pkl"
        if not face_service.save_face_encoding(student_id, face_encoding):
            raise HTTPException(status_code=500, detail="Failed to save face encoding")
        
        # Create user record
        new_user = User(
            name=name,
            student_id=student_id,
            email=email,
            face_encoding_path=encoding_path
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {
            "message": "User registered successfully",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "student_id": new_user.student_id,
                "email": new_user.email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@app.post("/api/check-in")
async def check_in(
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Check-in: Nhận diện khuôn mặt và ghi nhận thời gian vào"""
    try:
        # Read image data
        image_data = await image.read()
        
        # Recognize face
        recognition_result = face_service.recognize_face(image_data)
        
        if recognition_result is None:
            raise HTTPException(status_code=404, detail="Face not recognized. Please register first.")
        
        student_id, confidence = recognition_result
        
        # Get user
        user = db.query(User).filter(User.student_id == student_id).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=404, detail="User not found or inactive")
        
        # Check if already checked in today
        today = date.today().isoformat()
        existing_record = db.query(AttendanceRecord).filter(
            and_(
                AttendanceRecord.student_id == student_id,
                AttendanceRecord.date == today,
                AttendanceRecord.status == "checked_in"
            )
        ).first()
        
        if existing_record:
            raise HTTPException(status_code=400, detail="Already checked in today")
        
        # Create check-in record
        check_in_time = datetime.now()
        new_record = AttendanceRecord(
            user_id=user.id,
            student_id=student_id,
            name=user.name,
            check_in_time=check_in_time,
            date=today,
            status="checked_in",
            confidence=confidence
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        
        return {
            "message": "Check-in successful",
            "record": {
                "id": new_record.id,
                "student_id": student_id,
                "name": user.name,
                "check_in_time": check_in_time.isoformat(),
                "confidence": round(confidence, 2)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Check-in failed: {str(e)}")


@app.post("/api/check-out")
async def check_out(
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Check-out: Nhận diện khuôn mặt và ghi nhận thời gian ra"""
    try:
        # Read image data
        image_data = await image.read()
        
        # Recognize face
        recognition_result = face_service.recognize_face(image_data)
        
        if recognition_result is None:
            raise HTTPException(status_code=404, detail="Face not recognized. Please register first.")
        
        student_id, confidence = recognition_result
        
        # Get user
        user = db.query(User).filter(User.student_id == student_id).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=404, detail="User not found or inactive")
        
        # Find today's check-in record
        today = date.today().isoformat()
        record = db.query(AttendanceRecord).filter(
            and_(
                AttendanceRecord.student_id == student_id,
                AttendanceRecord.date == today,
                AttendanceRecord.status == "checked_in"
            )
        ).first()
        
        if not record:
            raise HTTPException(status_code=400, detail="No check-in record found for today")
        
        if record.check_out_time:
            raise HTTPException(status_code=400, detail="Already checked out today")
        
        # Update record with check-out time
        check_out_time = datetime.now()
        record.check_out_time = check_out_time
        record.status = "checked_out"
        record.confidence = confidence
        db.commit()
        
        return {
            "message": "Check-out successful",
            "record": {
                "id": record.id,
                "student_id": student_id,
                "name": user.name,
                "check_in_time": record.check_in_time.isoformat(),
                "check_out_time": check_out_time.isoformat(),
                "confidence": round(confidence, 2)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Check-out failed: {str(e)}")


@app.get("/api/users")
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lấy danh sách tất cả người dùng"""
    users = db.query(User).filter(User.is_active == True).offset(skip).limit(limit).all()
    return {
        "users": [
            {
                "id": user.id,
                "name": user.name,
                "student_id": user.student_id,
                "email": user.email,
                "created_at": user.created_at.isoformat()
            }
            for user in users
        ]
    }


@app.get("/api/attendance")
async def get_attendance(
    student_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lấy lịch sử điểm danh với các bộ lọc"""
    query = db.query(AttendanceRecord)
    
    if student_id:
        query = query.filter(AttendanceRecord.student_id == student_id)
    
    if start_date:
        query = query.filter(AttendanceRecord.date >= start_date)
    
    if end_date:
        query = query.filter(AttendanceRecord.date <= end_date)
    
    records = query.order_by(AttendanceRecord.check_in_time.desc()).offset(skip).limit(limit).all()
    
    return {
        "records": [
            {
                "id": record.id,
                "student_id": record.student_id,
                "name": record.name,
                "check_in_time": record.check_in_time.isoformat(),
                "check_out_time": record.check_out_time.isoformat() if record.check_out_time else None,
                "date": record.date,
                "status": record.status,
                "confidence": record.confidence
            }
            for record in records
        ]
    }


@app.get("/api/attendance/monthly-report")
async def get_monthly_report(
    year: int,
    month: int,
    db: Session = Depends(get_db)
):
    """Báo cáo điểm danh theo tháng"""
    start_date = f"{year}-{month:02d}-01"
    if month == 12:
        end_date = f"{year+1}-01-01"
    else:
        end_date = f"{year}-{month+1:02d}-01"
    
    records = db.query(AttendanceRecord).filter(
        and_(
            AttendanceRecord.date >= start_date,
            AttendanceRecord.date < end_date
        )
    ).all()
    
    # Group by student
    report_data = {}
    for record in records:
        if record.student_id not in report_data:
            report_data[record.student_id] = {
                "student_id": record.student_id,
                "name": record.name,
                "total_days": 0,
                "total_hours": 0,
                "records": []
            }
        
        report_data[record.student_id]["total_days"] += 1
        report_data[record.student_id]["records"].append({
            "date": record.date,
            "check_in": record.check_in_time.isoformat(),
            "check_out": record.check_out_time.isoformat() if record.check_out_time else None,
            "status": record.status
        })
        
        # Calculate hours if check-out exists
        if record.check_out_time:
            duration = record.check_out_time - record.check_in_time
            report_data[record.student_id]["total_hours"] += duration.total_seconds() / 3600
    
    return {
        "year": year,
        "month": month,
        "report": list(report_data.values())
    }


@app.get("/api/attendance/export")
async def export_attendance(
    format: str = "excel",  # excel or csv
    student_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Xuất báo cáo điểm danh ra file Excel hoặc CSV"""
    query = db.query(AttendanceRecord)
    
    if student_id:
        query = query.filter(AttendanceRecord.student_id == student_id)
    
    if start_date:
        query = query.filter(AttendanceRecord.date >= start_date)
    
    if end_date:
        query = query.filter(AttendanceRecord.date <= end_date)
    
    records = query.order_by(AttendanceRecord.check_in_time.desc()).all()
    
    # Prepare data for export
    data = []
    for record in records:
        data.append({
            "ID": record.id,
            "Mã sinh viên": record.student_id,
            "Họ tên": record.name,
            "Ngày": record.date,
            "Giờ vào": record.check_in_time.strftime("%H:%M:%S"),
            "Giờ ra": record.check_out_time.strftime("%H:%M:%S") if record.check_out_time else "",
            "Trạng thái": record.status,
            "Độ chính xác": f"{record.confidence:.2f}%" if record.confidence else ""
        })
    
    df = pd.DataFrame(data)
    
    if format == "excel":
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Điểm danh')
        output.seek(0)
        return FileResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename=f"attendance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        )
    else:  # CSV
        output = BytesIO()
        df.to_csv(output, index=False, encoding='utf-8-sig')
        output.seek(0)
        return FileResponse(
            output,
            media_type="text/csv",
            filename=f"attendance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        )


@app.delete("/api/users/{student_id}")
async def delete_user(
    student_id: str,
    db: Session = Depends(get_db)
):
    """Xóa người dùng"""
    user = db.query(User).filter(User.student_id == student_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    
    return {"message": "User deleted successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

