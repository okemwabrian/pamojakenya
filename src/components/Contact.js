import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Contact = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || ''
      }));
    }
  }, [isAuthenticated, user]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // API call to send message
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/contact/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}` 
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setSuccessMessage('Thank you! Your message has been sent successfully.');
      } else {
        throw new Error('Failed to send');
      }
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setErrorMessage('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white text-center">
              <h2 className="mb-0"><i className="bi bi-envelope-fill me-2"></i>Contact Us</h2>
              <p className="mb-0 mt-2">We'd love to hear from you. Fill out the form and we'll respond shortly.</p>
            </div>
            <div className="card-body p-4">
              {/* Success Message */}
              {successMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>{successMessage}
                  <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorMessage}
                  <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name Field */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label fw-semibold">
                    <i className="bi bi-person me-1"></i>Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    placeholder="Enter your full name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isAuthenticated}
                  />
                </div>

                {/* Email Field */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">
                    <i className="bi bi-envelope me-1"></i>Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="your.email@example.com"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isAuthenticated}
                  />
                </div>

                {/* Phone Field */}
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label fw-semibold">
                    <i className="bi bi-telephone me-1"></i>Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-control"
                    placeholder="(123) 456-7890"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Subject Field */}
                <div className="mb-3">
                  <label htmlFor="subject" className="form-label fw-semibold">
                    <i className="bi bi-chat-text me-1"></i>Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="form-control"
                    placeholder="What can we help you with?"
                    required
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    maxLength="100"
                  />
                </div>

                {/* Message Field */}
                <div className="mb-4">
                  <label htmlFor="message" className="form-label fw-semibold">
                    <i className="bi bi-chat-dots me-1"></i>Message *
                  </label>
                  <textarea
                    className="form-control"
                    id="message"
                    rows="6"
                    placeholder="Please provide details about your inquiry..."
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    maxLength="1000"
                  ></textarea>
                  <div className="form-text d-flex justify-content-between">
                      <small className="text-muted">Minimum 10 characters required</small>
                    <small className="text-muted">{formData.message.length}/1000 characters</small>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg" 
                    disabled={isSubmitting || !formData.name || !formData.email || !formData.phone || !formData.subject || formData.message.length < 10}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sending Email...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>Send Email
                      </>
                    )}
                  </button>
                </div>

                {/* Form Status */}
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    <i className="bi bi-shield-check me-1"></i>
                    Your information is secure. We'll respond within 24 hours.
                  </small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;