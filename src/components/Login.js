import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const result = await login(formData);
    
    if (result.success) {
      setSuccess('Welcome! Login successful.');
      setTimeout(() => {
        navigate(result.user?.is_staff ? '/admin-dashboard' : '/user-dashboard');
      }, 1500);
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg" style={{maxWidth: '400px', width: '100%'}}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <img src="/images/logo.png" alt="Pamoja Kenya MN" className="mb-3" style={{maxHeight: '60px'}} />
            <h2 className="h4 text-primary">Welcome Back</h2>
            <p className="text-muted">Sign in to your Pamoja Kenya MN account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username"
                className="form-control"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 mb-3" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <ErrorMessage message={error} onClose={() => setError('')} />
            <SuccessMessage message={success} onClose={() => setSuccess('')} />
          </form>

          <div className="text-center">
            <p className="mb-2">
              <Link to="/reset-password" className="text-decoration-none">Forgot your password?</Link>
            </p>
            <p className="mb-0">Don't have an account? 
              <Link to="/register" className="text-decoration-none fw-bold"> Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;