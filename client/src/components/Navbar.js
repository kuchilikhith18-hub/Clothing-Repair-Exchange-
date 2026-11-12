import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setDropdownOpen(false);
    navigate('/');
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="navbar-logo">🧵</span>
          <span className="navbar-title">Clothing Repair Exchange</span>
        </Link>

        <button
          className={`navbar-hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          <div className="navbar-links">
            <Link to="/" className="navbar-link" onClick={closeMenu}>
              Home
            </Link>
            <Link to="/requests" className="navbar-link" onClick={closeMenu}>
              Browse Requests
            </Link>
            <Link to="/volunteers" className="navbar-link" onClick={closeMenu}>
              Volunteers
            </Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="navbar-link" onClick={closeMenu}>
                Dashboard
              </Link>
            )}
          </div>

          <div className="navbar-actions">
            {isAuthenticated ? (
              <div className="navbar-user" ref={dropdownRef}>
                <button
                  className="navbar-user-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="navbar-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </span>
                  <span className="navbar-username">{user?.name || 'User'}</span>
                  <span className={`navbar-arrow ${dropdownOpen ? 'up' : ''}`}>▾</span>
                </button>
                {dropdownOpen && (
                  <div className="navbar-dropdown">
                    <Link to="/profile" className="navbar-dropdown-item" onClick={closeMenu}>
                      👤 Profile
                    </Link>
                    <Link to="/my-matches" className="navbar-dropdown-item" onClick={closeMenu}>
                      🤝 My Matches
                    </Link>
                    <hr className="navbar-dropdown-divider" />
                    <button className="navbar-dropdown-item navbar-logout" onClick={handleLogout}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="navbar-auth-btns">
                <Link to="/login" className="btn btn-outline btn-sm" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
