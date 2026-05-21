import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'
import '../styles/Auth.css'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    try {
      setLoading(true)
      const data = await register(formData)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.dispatchEvent(new Event('authChanged'))
      navigate('/cards')
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='auth-page'>
      <form className='auth-form' onSubmit={handleSubmit}>
        <div className='auth-header'>
          <h1>Đăng ký</h1>
          <p>Tạo tài khoản để lưu và chỉnh sửa thiệp mời.</p>
        </div>

        {error && <p className='error'>{error}</p>}

        <div className='form-group'>
          <label htmlFor='name'>Tên</label>
          <input
            id='name'
            name='name'
            type='text'
            value={formData.name}
            onChange={handleChange}
            placeholder='Tên của bạn'
            autoComplete='name'
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='email'>Email</label>
          <input
            id='email'
            name='email'
            type='email'
            value={formData.email}
            onChange={handleChange}
            placeholder='you@example.com'
            autoComplete='email'
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='password'>Mật khẩu</label>
          <input
            id='password'
            name='password'
            type='password'
            value={formData.password}
            onChange={handleChange}
            placeholder='Tối thiểu 6 ký tự'
            autoComplete='new-password'
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='confirmPassword'>Xác nhận mật khẩu</label>
          <input
            id='confirmPassword'
            name='confirmPassword'
            type='password'
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder='Nhập lại mật khẩu'
            autoComplete='new-password'
            required
          />
        </div>

        <button className='btn-primary auth-submit' type='submit' disabled={loading}>
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>

        <p className='auth-switch'>
          Đã có tài khoản? <Link to='/login'>Đăng nhập</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
