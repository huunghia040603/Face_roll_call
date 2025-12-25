import React, { useRef, useState } from 'react'
import axios from 'axios'

function CheckOut() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [lastRecord, setLastRecord] = useState(null)
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
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.style.display = 'block'
          
          const handleLoadedMetadata = () => {
            videoRef.current.play().then(() => {
              setIsVideoReady(true)
              setMessage({ type: 'success', text: '✅ Camera đã sẵn sàng! Nhấn Check-out để điểm danh ra về.' })
            }).catch(err => {
              console.error('Error playing video:', err)
              setMessage({ type: 'error', text: 'Không thể phát video. Vui lòng thử lại.' })
            })
          }
          
          const handleCanPlay = () => {
            setIsVideoReady(true)
            setMessage({ type: 'success', text: '✅ Camera đã sẵn sàng! Nhấn Check-out để điểm danh ra về.' })
          }
          
          videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
          videoRef.current.addEventListener('canplay', handleCanPlay, { once: true })
          videoRef.current.addEventListener('error', (e) => {
            console.error('Video error:', e)
            setMessage({ type: 'error', text: 'Lỗi khi tải video. Vui lòng thử lại.' })
          }, { once: true })
          
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
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setMessage({ type: 'error', text: 'Camera chưa được khởi tạo. Vui lòng bật camera trước.' })
      return null
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video.videoWidth || !video.videoHeight) {
      setMessage({ type: 'error', text: 'Video chưa sẵn sàng. Vui lòng đợi thêm một chút.' })
      return null
    }
    
    if (video.readyState < 2) {
      setMessage({ type: 'error', text: 'Đang tải video... Vui lòng đợi thêm một chút.' })
      return null
    }

    try {
      const context = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      return canvas.toDataURL('image/jpeg', 0.95)
    } catch (error) {
      console.error('Error capturing photo:', error)
      setMessage({ type: 'error', text: 'Lỗi khi chụp ảnh: ' + error.message })
      return null
    }
  }

  const handleCheckOut = async () => {
    if (!stream) {
      setMessage({ type: 'error', text: 'Vui lòng bật camera trước.' })
      return
    }

    if (!isVideoReady) {
      setMessage({ type: 'error', text: 'Camera đang khởi động. Vui lòng đợi thêm một chút...' })
      return
    }

    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const imageData = capturePhoto()
      if (!imageData) {
        setIsLoading(false)
        return
      }
      
      const fetchResponse = await fetch(imageData)
      const blob = await fetchResponse.blob()
      
      if (blob.size < 1000) {
        setMessage({ type: 'error', text: 'Ảnh quá nhỏ. Vui lòng thử lại.' })
        setIsLoading(false)
        return
      }
      
      const data = new FormData()
      data.append('image', blob, 'photo.jpg')

      const response = await axios.post('/api/check-out', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setMessage({ type: 'success', text: '✅ Check-out thành công!' })
      setLastRecord(response.data.record)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Check-out thất bại. Vui lòng thử lại.'
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
      <h2 className="page-title">Check-out - Điểm danh ra về</h2>
      <div className="card">
        {message.text && (
          <div className={`alert alert-${message.type === 'error' ? 'error' : message.type === 'success' ? 'success' : 'info'}`}>
            {message.text}
          </div>
        )}

        {lastRecord && (
          <div className="alert alert-success">
            <strong>Thông tin Check-out:</strong><br />
            Mã SV: {lastRecord.student_id}<br />
            Họ tên: {lastRecord.name}<br />
            Vào: {new Date(lastRecord.check_in_time).toLocaleString('vi-VN')}<br />
            Ra: {new Date(lastRecord.check_out_time).toLocaleString('vi-VN')}<br />
            Độ chính xác: {lastRecord.confidence}%
          </div>
        )}

        <div className="camera-controls">
          {!stream ? (
            <button type="button" className="btn btn-primary" onClick={startCamera}>
              Bật Camera
            </button>
          ) : (
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
              <button type="button" className="btn btn-secondary" onClick={stopCamera}>
                Tắt Camera
              </button>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            className="btn btn-danger"
            onClick={handleCheckOut}
            disabled={isLoading || !stream || !isVideoReady}
            style={{ fontSize: '18px', padding: '15px 30px', opacity: (isLoading || !stream || !isVideoReady) ? 0.6 : 1 }}
          >
            {isLoading ? 'Đang xử lý...' : isVideoReady ? '🚪 Check-out' : '⏳ Đang tải...'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckOut

