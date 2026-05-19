import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/Navbar.css'

function Navbar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className='navbar'>
      <div className='navbar-container'>
        <Link to='/' className='navbar-logo'>
          🎨 Tạo Thiệp Mời
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
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
