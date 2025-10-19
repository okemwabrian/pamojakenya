import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentsAPI } from '../services/api';

const ActivationCheck = ({ children }) => {
  const { user } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_proof: null
  });

  useEffect(() => {
    const checkPendingPayment = async () => {
      try {
        const response = await paymentsAPI.getPayments();
        const payments = Array.isArray(response.data) ? response.data : [];
        const activationPayments = payments.filter(p => 
          p.payment_type === 'activation_fee' && p.status === 'pending'
        );
        setHasPendingPayment(activationPayments.length > 0);
      } catch (err) {
        console.error('Error checking payments:', err);
        setHasPendingPayment(false);
      }
    };
    
    if (user && !user.is_activated) {
      checkPendingPayment();
    }
  }, [user]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentData.amount || !paymentData.payment_proof) {
      alert('❌ Please fill all fields and upload payment proof');
      return;
    }

    const formData = new FormData();
    formData.append('amount', paymentData.amount);
    formData.append('payment_proof', paymentData.payment_proof);

    try {
      await paymentsAPI.submitActivationFee(formData);
      alert('✅ Payment submitted successfully! Admin will review and activate your account.');
      setShowPayment(false);
      window.location.reload();
    } catch (err) {
      console.error('Payment error:', err);
      alert('❌ Payment failed: ' + (err.response?.data?.message || 'Please try again'));
    }
  };

  if (!user) {
    return children;
  }

  if (user.is_activated) {
    return children;
  }

  if (hasPendingPayment) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-info shadow">
              <div className="card-header bg-info text-white text-center">
                <h4 className="mb-0">⏳ Activation Payment Pending</h4>
              </div>
              <div className="card-body text-center p-4">
                <div className="mb-4">
                  <i className="bi bi-clock-history display-1 text-info"></i>
                </div>
                <h5 className="mb-3">Payment Under Review</h5>
                <p className="text-muted mb-4">
                  Your activation fee payment has been submitted and is being reviewed by admin.
                  You will receive an email confirmation once your account is activated.
                </p>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Status:</strong> Pending Admin Approval
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-warning shadow">
            <div className="card-header bg-warning text-dark text-center">
              <h4 className="mb-0">⚠️ Account Activation Required</h4>
            </div>
            <div className="card-body text-center p-4">
              <div className="mb-4">
                <i className="bi bi-exclamation-triangle display-1 text-warning"></i>
              </div>
              
              <h5 className="mb-3">Welcome, {user.username}!</h5>
              <p className="text-muted mb-4">
                Your account is currently inactive. To access all features including:
              </p>
              
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="p-3 bg-light rounded">
                    <i className="bi bi-file-text text-primary"></i>
                    <small className="d-block mt-1">Membership Applications</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded">
                    <i className="bi bi-piggy-bank text-success"></i>
                    <small className="d-block mt-1">Share Purchases</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded">
                    <i className="bi bi-heart-pulse text-danger"></i>
                    <small className="d-block mt-1">Benefit Claims</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded">
                    <i className="bi bi-camera-video text-info"></i>
                    <small className="d-block mt-1">Meeting Registration</small>
                  </div>
                </div>
              </div>
              
              <p className="mb-4">
                <strong>You need to pay the activation fee.</strong>
              </p>
              
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-warning btn-lg"
                  onClick={() => setShowPayment(true)}
                >
                  <i className="bi bi-credit-card me-2"></i>
                  Pay Activation Fee
                </button>
                
                <small className="text-muted mt-2">
                  After payment, admin will activate your account and you'll receive an email confirmation.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">💳 Pay Activation Fee</h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowPayment(false)}
                ></button>
              </div>
              <form onSubmit={handlePaymentSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Amount (USD)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData(prev => ({...prev, amount: e.target.value}))}
                      placeholder="Enter activation fee amount (e.g. 50)"
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Payment Proof</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*,.pdf"
                      onChange={(e) => setPaymentData(prev => ({...prev, payment_proof: e.target.files[0]}))}
                      required
                    />
                    <small className="text-muted">
                      Upload receipt, screenshot, or proof of payment
                    </small>
                  </div>
                  
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Payment Instructions:</strong>
                    <ul className="mb-0 mt-2">
                      <li>Make payment via your preferred method</li>
                      <li>Upload clear proof of payment</li>
                      <li>Admin will review and activate your account</li>
                      <li>You'll receive email confirmation</li>
                    </ul>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowPayment(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning">
                    <i className="bi bi-upload me-1"></i>Submit Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivationCheck;