import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Globe,
  Lock,
  Plus,
  LogOut,
  LogIn,
  UserPlus,
  Home,
  Grid,
  Sparkles,
  Menu,
  X,
  Shield,
} from "lucide-react";
import "../styles/Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const syncUser = () => {
      const savedUser = localStorage.getItem("user");
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener("storage", syncUser);
    window.addEventListener("authChanged", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("authChanged", syncUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <Sparkles size={24} style={{ marginRight: "8px" }} />
          Tạo Thiệp Mời
        </Link>

        {/* Mobile menu button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation menu */}
        <ul className={`navbar-menu ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {/* Home Link */}
          <li>
            <Link
              to="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
              onClick={closeMobileMenu}
            >
              <Home size={18} />
              <span>Trang Chủ</span>
            </Link>
          </li>

          {/* Public Cards - Always visible */}
          <li>
            <Link
              to="/cards/public"
              className={`nav-link ${isActive("/cards/public") ? "active" : ""}`}
              onClick={closeMobileMenu}
            >
              <Globe size={18} />
              <span>Khám Phá</span>
            </Link>
          </li>

          {/* User's Cards - Only when logged in */}
          {user && (
            <li>
              <Link
                to="/cards"
                className={`nav-link ${isActive("/cards") ? "active" : ""}`}
                onClick={closeMobileMenu}
              >
                <Lock size={18} />
                <span>Thiệp Của Tôi</span>
              </Link>
            </li>
          )}

          {/* Create Card - Only when logged in */}
          {user && (
            <li>
              <Link
                to="/cards/create"
                className={`nav-link nav-link-primary ${isActive("/cards/create") ? "active" : ""}`}
                onClick={closeMobileMenu}
              >
                <Plus size={18} />
                <span>Tạo Thiệp</span>
              </Link>
            </li>
          )}

          {/* Admin Link - Only for admin users */}
          {isAdmin && (
            <li>
              <Link
                to="/admin"
                className={`nav-link nav-link-admin ${isActive("/admin") ? "active" : ""}`}
                onClick={closeMobileMenu}
              >
                <Shield size={18} />
                <span>Quản Trị</span>
              </Link>
            </li>
          )}

          {/* User Authentication Section */}
          {user ? (
            <>
              <li className="nav-user">
                <span className="user-greeting">
                  👋 {user.name || user.full_name || user.username}
                </span>
              </li>
              <li>
                <button
                  className="nav-link nav-button"
                  type="button"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className={`nav-link ${isActive("/login") ? "active" : ""}`}
                  onClick={closeMobileMenu}
                >
                  <LogIn size={18} />
                  <span>Đăng nhập</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className={`nav-link ${isActive("/register") ? "active" : ""}`}
                  onClick={closeMobileMenu}
                >
                  <UserPlus size={18} />
                  <span>Đăng ký</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
