import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import '../styles/Navbar.css'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    const syncUser = () => {
      const savedUser = localStorage.getItem('user')
      setUser(savedUser ? JSON.parse(savedUser) : null)
    }

    window.addEventListener('storage', syncUser)
    window.addEventListener('authChanged', syncUser)
    return () => {
      window.removeEventListener('storage', syncUser)
      window.removeEventListener('authChanged', syncUser)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  return (
    <nav className='navbar'>
      <div className='navbar-container'>
        <Link to='/' className='navbar-logo'>
          Tạo Thiệp Mời
        </Link>

        <ul className='navbar-menu'>
          <li>
            <Link
              to='/'
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Trang Chủ
            </Link>
          </li>
          <li>
            <Link
              to='/cards'
              className={`nav-link ${isActive('/cards') ? 'active' : ''}`}
            >
              Danh Sách Thiệp
            </Link>
          </li>
          <li>
            <Link
              to='/cards/create'
              className={`nav-link nav-link-primary ${isActive('/cards/create') ? 'active' : ''}`}
            >
              + Tạo Thiệp
            </Link>
          </li>
          {user ? (
            <>
              {user.role === 'admin' && (
                <li>
                  <Link
                    to='/admin'
                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  >
                    Admin
                  </Link>
                </li>
              )}
              <li className='nav-user'>Xin chào, {user.name}</li>
              <li>
                <button className='nav-link nav-button' type='button' onClick={handleLogout}>
                  Đăng xuất
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to='/login'
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                >
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link
                  to='/register'
                  className={`nav-link ${isActive('/register') ? 'active' : ''}`}
                >
                  Đăng ký
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
