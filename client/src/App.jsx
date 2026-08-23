import { useCallback, useEffect, useState } from 'react'
import './App.css'

function App() {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ studentId: '', name: '', email: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch('/api/students')
      if (!response.ok) throw new Error('Không thể kết nối đến máy chủ')

      const data = await response.json()
      setStudents(Array.isArray(data) ? data : [])
    } catch (requestError) {
      setError(requestError.message || 'Đã xảy ra lỗi khi tải dữ liệu')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    setError('')
    fetchStudents()
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
    setSubmitMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Không thể thêm sinh viên')

      setFormData({ studentId: '', name: '', email: '' })
      setSubmitMessage('Đã thêm sinh viên thành công.')
      await fetchStudents()
    } catch (requestError) {
      setSubmitMessage(requestError.message || 'Đã xảy ra lỗi khi thêm sinh viên')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Cổng quản lý đào tạo</p>
          <h1>Danh sách sinh viên</h1>
          <p className="subtitle">Dữ liệu được cập nhật trực tiếp từ Backend API.</p>
        </div>
        <button className="refresh-button" type="button" onClick={handleRefresh} disabled={isLoading}>
          <span aria-hidden="true">↻</span>
          {isLoading ? 'Đang tải...' : 'Tải lại'}
        </button>
      </header>

      <section className="form-card" aria-labelledby="form-title">
        <div className="form-heading">
          <p className="eyebrow">Thông tin mới</p>
          <h2 id="form-title">Thêm sinh viên</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            MSSV
            <input name="studentId" value={formData.studentId} onChange={handleInputChange} placeholder="Ví dụ: SV001" required />
          </label>
          <label>
            Họ và tên
            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Nguyễn Văn A" required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="sinhvien@example.com" required />
          </label>
          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Thêm sinh viên'}
          </button>
        </form>
        {submitMessage && <p className={`form-message ${submitMessage.startsWith('Đã') ? 'success-message' : 'error-message'}`}>{submitMessage}</p>}
      </section>

      <section className="summary-bar" aria-label="Tổng quan danh sách">
        <div className="summary-icon" aria-hidden="true">SV</div>
        <div><strong>{students.length}</strong><span>sinh viên trong hệ thống</span></div>
        <span className="api-status"><span className="status-dot" /> API đang kết nối</span>
      </section>

      <section className="table-card" aria-label="Bảng danh sách sinh viên">
        {isLoading && <div className="state-message">Đang tải danh sách sinh viên...</div>}
        {!isLoading && error && (
          <div className="state-message error-state">
            <strong>Không thể tải dữ liệu</strong>
            <span>{error}. Hãy kiểm tra Backend đang chạy ở cổng 5000.</span>
            <button type="button" onClick={handleRefresh}>Thử lại</button>
          </div>
        )}
        {!isLoading && !error && students.length === 0 && (
          <div className="state-message">Chưa có sinh viên nào trong hệ thống.</div>
        )}
        {!isLoading && !error && students.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>STT</th><th>Mã sinh viên</th><th>Họ và tên</th><th>Email</th></tr></thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student._id || student.studentId}>
                    <td className="index-cell">{String(index + 1).padStart(2, '0')}</td>
                    <td><span className="student-id">{student.studentId}</span></td>
                    <td className="name-cell">{student.name}</td>
                    <td><a href={`mailto:${student.email}`}>{student.email}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
