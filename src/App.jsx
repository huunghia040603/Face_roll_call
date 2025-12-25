import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Register from './components/Register'
import CheckIn from './components/CheckIn'
import CheckOut from './components/CheckOut'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">🎯 Hệ thống điểm danh bằng khuôn mặt</h1>
          <div className="nav-links">
            <Link to="/register">Đăng ký</Link>
            <Link to="/check-in">Check-in</Link>
            <Link to="/check-out">Check-out</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/check-out" element={<CheckOut />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  )
}

function Home() {
  return (
    <div className="card">
      <h2>Chào mừng đến với hệ thống điểm danh thông minh</h2>
      <p style={{ marginTop: '20px', fontSize: '18px', lineHeight: '1.6' }}>
        Hệ thống điểm danh tự động bằng công nghệ nhận diện khuôn mặt giúp quản lý 
        chuyên cần một cách khoa học và minh bạch.
      </p>
      <div style={{ marginTop: '30px' }}>
        <h3>Chức năng chính:</h3>
        <ul style={{ marginTop: '15px', fontSize: '16px', lineHeight: '2' }}>
          <li>📝 <strong>Đăng ký:</strong> Chụp ảnh và lưu trữ đặc trưng khuôn mặt</li>
          <li>✅ <strong>Check-in:</strong> Nhận diện và ghi nhận thời gian vào lớp</li>
          <li>🚪 <strong>Check-out:</strong> Nhận diện và ghi nhận thời gian ra về</li>
          <li>📊 <strong>Dashboard:</strong> Xem lịch sử và xuất báo cáo</li>
        </ul>
      </div>
    </div>
  )
}

export default App

