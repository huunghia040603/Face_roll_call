import React, { useState, useEffect } from 'react'
import axios from 'axios'

function Dashboard() {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({
    student_id: '',
    start_date: '',
    end_date: ''
  })
  const [monthlyReport, setMonthlyReport] = useState(null)
  const [reportFilters, setReportFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('records')

  useEffect(() => {
    loadUsers()
    loadAttendanceRecords()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await axios.get('/api/users')
      setUsers(response.data.users)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadAttendanceRecords = async () => {
    setIsLoading(true)
    try {
      const params = {}
      if (filters.student_id) params.student_id = filters.student_id
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date

      const response = await axios.get('/api/attendance', { params })
      setAttendanceRecords(response.data.records)
    } catch (error) {
      console.error('Error loading attendance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMonthlyReport = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/attendance/monthly-report', {
        params: {
          year: reportFilters.year,
          month: reportFilters.month
        }
      })
      setMonthlyReport(response.data)
    } catch (error) {
      console.error('Error loading monthly report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = async (format) => {
    try {
      const params = { format }
      if (filters.student_id) params.student_id = filters.student_id
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date

      const response = await axios.get('/api/attendance/export', {
        params,
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance_report.${format === 'excel' ? 'xlsx' : 'csv'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error exporting report:', error)
      alert('Xuất báo cáo thất bại')
    }
  }

  return (
    <div>
      <h2 className="page-title">Dashboard - Quản lý dữ liệu</h2>

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
          <button
            className={`btn ${activeTab === 'records' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('records')}
          >
            Lịch sử điểm danh
          </button>
          <button
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            Danh sách người dùng
          </button>
          <button
            className={`btn ${activeTab === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveTab('monthly')
              loadMonthlyReport()
            }}
          >
            Báo cáo tháng
          </button>
        </div>

        {activeTab === 'records' && (
          <div>
            <h3>Lọc dữ liệu</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label>Mã sinh viên</label>
                <input
                  type="text"
                  value={filters.student_id}
                  onChange={(e) => setFilters({ ...filters, student_id: e.target.value })}
                />
              </div>
              <div>
                <label>Từ ngày</label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                />
              </div>
              <div>
                <label>Đến ngày</label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                />
              </div>
            </div>
            <button className="btn btn-primary" onClick={loadAttendanceRecords}>
              Tìm kiếm
            </button>
            <button className="btn btn-success" onClick={() => exportReport('excel')}>
              Xuất Excel
            </button>
            <button className="btn btn-success" onClick={() => exportReport('csv')}>
              Xuất CSV
            </button>

            {isLoading ? (
              <div className="loading">Đang tải...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Mã SV</th>
                    <th>Họ tên</th>
                    <th>Ngày</th>
                    <th>Giờ vào</th>
                    <th>Giờ ra</th>
                    <th>Trạng thái</th>
                    <th>Độ chính xác</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                    </tr>
                  ) : (
                    attendanceRecords.map((record) => (
                      <tr key={record.id}>
                        <td>{record.student_id}</td>
                        <td>{record.name}</td>
                        <td>{record.date}</td>
                        <td>{new Date(record.check_in_time).toLocaleTimeString('vi-VN')}</td>
                        <td>{record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString('vi-VN') : '-'}</td>
                        <td>{record.status === 'checked_in' ? 'Đã vào' : 'Đã ra'}</td>
                        <td>{record.confidence ? `${record.confidence.toFixed(2)}%` : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h3>Danh sách người dùng ({users.length})</h3>
            {isLoading ? (
              <div className="loading">Đang tải...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Mã SV</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Ngày đăng ký</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.student_id}</td>
                        <td>{user.name}</td>
                        <td>{user.email || '-'}</td>
                        <td>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'monthly' && (
          <div>
            <h3>Báo cáo tháng</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label>Năm</label>
                <input
                  type="number"
                  value={reportFilters.year}
                  onChange={(e) => setReportFilters({ ...reportFilters, year: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label>Tháng</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={reportFilters.month}
                  onChange={(e) => setReportFilters({ ...reportFilters, month: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <button className="btn btn-primary" onClick={loadMonthlyReport}>
              Xem báo cáo
            </button>

            {isLoading ? (
              <div className="loading">Đang tải...</div>
            ) : monthlyReport ? (
              <div style={{ marginTop: '20px' }}>
                <h4>Báo cáo tháng {reportFilters.month}/{reportFilters.year}</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Mã SV</th>
                      <th>Họ tên</th>
                      <th>Số ngày</th>
                      <th>Tổng giờ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyReport.report.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                      </tr>
                    ) : (
                      monthlyReport.report.map((item, index) => (
                        <tr key={index}>
                          <td>{item.student_id}</td>
                          <td>{item.name}</td>
                          <td>{item.total_days}</td>
                          <td>{item.total_hours.toFixed(2)} giờ</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

