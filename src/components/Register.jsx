import React, { useRef, useState } from 'react'
import axios from 'axios'

function Register() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    student_id: '',
    email: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isVideoReady, setIsVideoReady] = useState(false)

  const startCamera = async () => {
    try {
      setMessage({ type: 'info', text: 'Đang khởi động camera...' })
      setIsVideoReady(false)
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })
      
      setStream(mediaStream)
      
      // Sử dụng setTimeout để đảm bảo videoRef đã được render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          
          // Đảm bảo video được hiển thị
          videoRef.current.style.display = 'block'
          
          // Đợi video sẵn sàng
          const handleLoadedMetadata = () => {
            videoRef.current.play().then(() => {
              setIsVideoReady(true)
              setMessage({ type: 'success', text: '✅ Camera đã sẵn sàng! Bạn có thể chụp ảnh.' })
            }).catch(err => {
              console.error('Error playing video:', err)
              setMessage({ type: 'error', text: 'Không thể phát video. Vui lòng thử lại.' })
            })
          }
          
          const handleCanPlay = () => {
            setIsVideoReady(true)
            setMessage({ type: 'success', text: '✅ Camera đã sẵn sàng! Bạn có thể chụp ảnh.' })
          }
          
          videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
          videoRef.current.addEventListener('canplay', handleCanPlay, { once: true })
          videoRef.current.addEventListener('error', (e) => {
            console.error('Video error:', e)
            setMessage({ type: 'error', text: 'Lỗi khi tải video. Vui lòng thử lại.' })
          }, { once: true })
          
          // Force play
          videoRef.current.play().catch(err => {
            console.error('Play error:', err)
          })
        }
      }, 100)
    } catch (error) {
      console.error('Camera error:', error)
      setMessage({ type: 'error', text: 'Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập và thử lại.' })
      setIsVideoReady(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsVideoReady(false)
      setCapturedImage(null)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setMessage({ type: 'error', text: 'Camera chưa được khởi tạo. Vui lòng bật camera trước.' })
      return null
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    
    // Kiểm tra video có dữ liệu không
    if (!video.videoWidth || !video.videoHeight) {
      setMessage({ type: 'error', text: 'Video chưa sẵn sàng. Vui lòng đợi thêm một chút.' })
      return null
    }
    
    // Kiểm tra readyState (nhưng không quá strict)
    if (video.readyState < 2) { // HAVE_CURRENT_DATA hoặc cao hơn
      setMessage({ type: 'error', text: 'Đang tải video... Vui lòng đợi thêm một chút.' })
      return null
    }

    try {
      const context = canvas.getContext('2d')

      // Đặt kích thước canvas đúng với video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Vẽ ảnh từ video lên canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Chuyển đổi sang JPEG với chất lượng cao (0.95)
      const imageData = canvas.toDataURL('image/jpeg', 0.95)
      
      // Kiểm tra xem ảnh có dữ liệu không
      if (!imageData || imageData.length < 1000) {
        setMessage({ type: 'error', text: 'Không thể tạo ảnh. Vui lòng thử lại.' })
        return null
      }
      
      setCapturedImage(imageData)
      setMessage({ type: 'success', text: '✅ Đã chụp ảnh thành công! Kiểm tra ảnh và nhấn Đăng ký.' })
      return imageData
    } catch (error) {
      console.error('Error capturing photo:', error)
      setMessage({ type: 'error', text: 'Lỗi khi chụp ảnh: ' + error.message })
      return null
    }
  }

  const handleCapture = () => {
    if (!stream) {
      setMessage({ type: 'error', text: 'Vui lòng bật camera trước.' })
      return
    }
    
    if (!isVideoReady) {
      setMessage({ type: 'error', text: 'Camera đang khởi động. Vui lòng đợi thêm một chút...' })
      return
    }
    
    const result = capturePhoto()
    if (!result) {
      // Nếu chụp thất bại, thử lại sau 1 giây
      setTimeout(() => {
        if (stream && isVideoReady) {
          capturePhoto()
        }
      }, 1000)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setMessage({ type: 'info', text: 'Vui lòng chụp ảnh lại.' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.student_id) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin bắt buộc.' })
      return
    }

    if (!stream) {
      setMessage({ type: 'error', text: 'Vui lòng bật camera trước.' })
      return
    }

    if (!capturedImage) {
      setMessage({ type: 'error', text: 'Vui lòng chụp ảnh trước khi đăng ký.' })
      return
    }

    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const imageData = capturedImage
      
      // Chuyển đổi base64 sang blob với chất lượng cao
      const fetchResponse = await fetch(imageData)
      const blob = await fetchResponse.blob()
      
      // Kiểm tra kích thước file
      if (blob.size < 1000) {
        setMessage({ type: 'error', text: 'Ảnh quá nhỏ. Vui lòng chụp lại.' })
        setIsLoading(false)
        return
      }
      
      const data = new FormData()
      data.append('name', formData.name)
      data.append('student_id', formData.student_id)
      if (formData.email) data.append('email', formData.email)
      data.append('image', blob, 'photo.jpg')

      const response = await axios.post('/api/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setMessage({ type: 'success', text: 'Đăng ký thành công!' })
      setFormData({ name: '', student_id: '', email: '' })
      setCapturedImage(null)
      stopCamera()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Đăng ký thất bại. Vui lòng thử lại.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stream])

  return (
    <div>
      <h2 className="page-title">Đăng ký người dùng mới</h2>
      <div className="card">
        {message.text && (
          <div className={`alert alert-${message.type === 'error' ? 'error' : message.type === 'success' ? 'success' : 'info'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Họ và tên *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <label>Mã sinh viên *</label>
          <input
            type="text"
            value={formData.student_id}
            onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
            required
          />

          <label>Email (tùy chọn)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <div className="camera-controls">
            {!stream ? (
              <button type="button" className="btn btn-primary" onClick={startCamera}>
                Bật Camera
              </button>
            ) : (
              <>
                {!capturedImage ? (
                  <>
                    <div className="video-container">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        style={{ 
                          width: '100%', 
                          height: 'auto',
                          display: 'block',
                          backgroundColor: '#000'
                        }}
                      ></video>
                      <canvas ref={canvasRef}></canvas>
                    </div>
                    {!isVideoReady && (
                      <div style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}>
                        ⏳ Đang tải video...
                      </div>
                    )}
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                      <button 
                        type="button" 
                        className="btn btn-success" 
                        onClick={handleCapture} 
                        disabled={!isVideoReady}
                        style={{ fontSize: '18px', padding: '12px 30px', opacity: isVideoReady ? 1 : 0.6 }}
                      >
                        📸 {isVideoReady ? 'Chụp ảnh' : 'Đang tải...'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={stopCamera} style={{ marginLeft: '10px' }}>
                        Tắt Camera
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="video-container" style={{ position: 'relative' }}>
                      <img src={capturedImage} alt="Captured" style={{ width: '100%', borderRadius: '12px' }} />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '8px 12px', borderRadius: '6px', fontSize: '14px' }}>
                        ✅ Đã chụp
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                      <button type="button" className="btn btn-primary" onClick={retakePhoto}>
                        🔄 Chụp lại
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={stopCamera} style={{ marginLeft: '10px' }}>
                        Tắt Camera
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading || !stream || !capturedImage} style={{ width: '100%', marginTop: '20px', fontSize: '18px', padding: '15px' }}>
            {isLoading ? 'Đang xử lý...' : '✅ Đăng ký'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Register

