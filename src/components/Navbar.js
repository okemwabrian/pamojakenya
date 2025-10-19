import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{background: 'linear-gradient(135deg, #1B3C53, #234C6A)', boxShadow: '0 4px 15px rgba(27, 60, 83, 0.3)'}}>
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <img src="/images/logo.png" alt="Pamoja Kenya" height="40" className="me-2" />
          Pamoja Kenya MN
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsOpen(!isOpen)}
          style={{border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'}}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={closeMenu}>Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about" onClick={closeMenu}>About</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/announcements" onClick={closeMenu}>Announcements</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/meetings" onClick={closeMenu}>Meetings</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact" onClick={closeMenu}>Contact</Link>
            </li>
          </ul>
          
          <ul className="navbar-nav">
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={closeMenu}>Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register" onClick={closeMenu}>Register</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/user-dashboard" onClick={closeMenu}>
                    <i className="bi bi-speedometer2 me-1"></i>Dashboard
                  </Link>
                </li>
                {user?.is_staff && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin-dashboard" onClick={closeMenu}>
                      <i className="bi bi-gear me-1"></i>Admin
                    </Link>
                  </li>
                )}
                <li className="nav-item dropdown">
                  <button className="nav-link dropdown-toggle btn btn-link" data-bs-toggle="dropdown" style={{background: 'rgba(255,255,255,0.1)', borderRadius: '8px', transition: 'all 0.3s ease'}}>
                    <i className="bi bi-person me-1"></i>Account
                  </button>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/profile" onClick={closeMenu}>Profile</Link></li>
                    <li><Link className="dropdown-item" to="/my-applications" onClick={closeMenu}>My Applications</Link></li>
                    <li><Link className="dropdown-item" to="/payments" onClick={closeMenu}>My Payments</Link></li>
                    <li><Link className="dropdown-item" to="/claims" onClick={closeMenu}>My Claims</Link></li>
                    <li><Link className="dropdown-item" to="/documents" onClick={closeMenu}>My Documents</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;