try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    print("⚠️  WARNING: face_recognition chưa được cài đặt. Vui lòng chạy: pip3 install face-recognition")
    print("   Trên macOS, có thể cần: brew install cmake trước")

import numpy as np
import cv2
import os
import pickle
from typing import Optional, Tuple, List
import base64
from io import BytesIO
from PIL import Image


class FaceRecognitionService:
    def __init__(self, known_faces_dir: str = "known_faces"):
        self.known_faces_dir = known_faces_dir
        os.makedirs(known_faces_dir, exist_ok=True)
        self.known_encodings = {}
        self.known_ids = {}
        self.load_known_faces()
    
    def load_known_faces(self):
        """Load all known face encodings from disk"""
        if not os.path.exists(self.known_faces_dir):
            return
        
        for filename in os.listdir(self.known_faces_dir):
            if filename.endswith('.pkl'):
                filepath = os.path.join(self.known_faces_dir, filename)
                student_id = filename.replace('.pkl', '')
                try:
                    with open(filepath, 'rb') as f:
                        encoding = pickle.load(f)
                    self.known_encodings[student_id] = encoding
                    self.known_ids[student_id] = student_id
                except Exception as e:
                    print(f"Error loading face encoding for {student_id}: {e}")
    
    def encode_face_from_image(self, image_data: bytes) -> Optional[np.ndarray]:
        """Encode face from image bytes"""
        if not FACE_RECOGNITION_AVAILABLE:
            raise ImportError("face_recognition chưa được cài đặt. Vui lòng cài đặt: pip3 install face-recognition")
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                print("Error: Could not decode image")
                return None
            
            # Kiểm tra kích thước ảnh
            if image.size == 0:
                print("Error: Image is empty")
                return None
            
            # Resize ảnh nếu quá lớn (tối đa 1920px) để tăng tốc độ xử lý
            height, width = image.shape[:2]
            max_dimension = 1920
            if width > max_dimension or height > max_dimension:
                scale = max_dimension / max(width, height)
                new_width = int(width * scale)
                new_height = int(height * scale)
                image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
                print(f"Resized image from {width}x{height} to {new_width}x{new_height}")
            
            # Convert BGR to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Tăng độ nhạy bằng cách thử nhiều model
            # Model 1: HOG (nhanh hơn, ít chính xác hơn)
            face_locations = face_recognition.face_locations(rgb_image, model='hog')
            
            # Nếu không tìm thấy, thử model CNN (chậm hơn nhưng chính xác hơn)
            if len(face_locations) == 0:
                print("Trying CNN model...")
                face_locations = face_recognition.face_locations(rgb_image, model='cnn')
            
            if len(face_locations) == 0:
                print("No face detected in image")
                return None
            
            print(f"Found {len(face_locations)} face(s) in image")
            
            # Get face encodings
            face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
            
            if len(face_encodings) == 0:
                print("Could not generate face encoding")
                return None
            
            # Return the first face encoding (face lớn nhất nếu có nhiều)
            # Ưu tiên face ở giữa ảnh
            if len(face_encodings) > 1:
                # Tìm face gần trung tâm nhất
                center_x, center_y = rgb_image.shape[1] // 2, rgb_image.shape[0] // 2
                min_dist = float('inf')
                best_idx = 0
                for idx, (top, right, bottom, left) in enumerate(face_locations):
                    face_center_x = (left + right) // 2
                    face_center_y = (top + bottom) // 2
                    dist = ((face_center_x - center_x) ** 2 + (face_center_y - center_y) ** 2) ** 0.5
                    if dist < min_dist:
                        min_dist = dist
                        best_idx = idx
                return face_encodings[best_idx]
            
            return face_encodings[0]
        except Exception as e:
            print(f"Error encoding face: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def encode_face_from_base64(self, base64_string: str) -> Optional[np.ndarray]:
        """Encode face from base64 string"""
        try:
            # Remove data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            image_data = base64.b64decode(base64_string)
            return self.encode_face_from_image(image_data)
        except Exception as e:
            print(f"Error decoding base64: {e}")
            return None
    
    def save_face_encoding(self, student_id: str, encoding: np.ndarray) -> bool:
        """Save face encoding to disk"""
        try:
            filepath = os.path.join(self.known_faces_dir, f"{student_id}.pkl")
            with open(filepath, 'wb') as f:
                pickle.dump(encoding, f)
            
            # Update in-memory cache
            self.known_encodings[student_id] = encoding
            self.known_ids[student_id] = student_id
            return True
        except Exception as e:
            print(f"Error saving face encoding: {e}")
            return False
    
    def recognize_face(self, image_data: bytes, tolerance: float = 0.6) -> Optional[Tuple[str, float]]:
        """
        Recognize face from image bytes
        Returns: (student_id, confidence) or None
        """
        if not FACE_RECOGNITION_AVAILABLE:
            raise ImportError("face_recognition chưa được cài đặt. Vui lòng cài đặt: pip3 install face-recognition")
        try:
            # Encode the face from the image
            face_encoding = self.encode_face_from_image(image_data)
            
            if face_encoding is None:
                return None
            
            # Compare with known faces
            best_match = None
            best_distance = float('inf')
            
            for student_id, known_encoding in self.known_encodings.items():
                # Calculate face distance
                distance = face_recognition.face_distance([known_encoding], face_encoding)[0]
                
                if distance < tolerance and distance < best_distance:
                    best_distance = distance
                    best_match = student_id
            
            if best_match:
                # Convert distance to confidence (0-100)
                confidence = (1 - best_distance) * 100
                return (best_match, confidence)
            
            return None
        except Exception as e:
            print(f"Error recognizing face: {e}")
            return None
    
    def recognize_face_from_base64(self, base64_string: str, tolerance: float = 0.6) -> Optional[Tuple[str, float]]:
        """Recognize face from base64 string"""
        try:
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            image_data = base64.b64decode(base64_string)
            return self.recognize_face(image_data, tolerance)
        except Exception as e:
            print(f"Error recognizing face from base64: {e}")
            return None
    
    def detect_faces_in_image(self, image_data: bytes) -> List[dict]:
        """Detect all faces in an image and return their locations"""
        try:
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return []
            
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_image)
            
            faces = []
            for top, right, bottom, left in face_locations:
                faces.append({
                    "top": int(top),
                    "right": int(right),
                    "bottom": int(bottom),
                    "left": int(left)
                })
            
            return faces
        except Exception as e:
            print(f"Error detecting faces: {e}")
            return []


# Global instance
face_service = FaceRecognitionService()

