import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import '../styles/Auth.css'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    if (!formData.email || !formData.password) {
      setError('Vui lòng nhập email và mật khẩu')
      return
    }

    try {
      setLoading(true)
      const data = await login(formData)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.dispatchEvent(new Event('authChanged'))
      navigate('/cards')
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='auth-page'>
      <form className='auth-form' onSubmit={handleSubmit}>
        <div className='auth-header'>
          <h1>Đăng nhập</h1>
          <p>Tiếp tục tạo và quản lý thiệp mời của bạn.</p>
        </div>

        {error && <p className='error'>{error}</p>}

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
            placeholder='Nhập mật khẩu'
            autoComplete='current-password'
            required
          />
        </div>

        <button className='btn-primary auth-submit' type='submit' disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <p className='auth-switch'>
          Chưa có tài khoản? <Link to='/register'>Đăng ký</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
