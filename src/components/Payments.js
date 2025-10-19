import React, { useState, useEffect } from 'react';
import { paymentsAPI } from '../services/api';
import { useSnackbar } from '../hooks/useSnackbar';
import Snackbar from './Snackbar';

const Payments = () => {
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    payment_type: 'activation_fee',
    amount: '',
    description: '',
    payment_method: '',
    transaction_id: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [myPayments, setMyPayments] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const paymentTypes = {
    activation_fee: 'Activation Fee',
    membership_single: 'Single Membership',
    membership_double: 'Double Membership', 
    shares: 'Share Purchase',
    other: 'Other'
  };

  useEffect(() => {
    loadMyPayments();
  }, []);

  const loadMyPayments = async () => {
    try {
      const response = await paymentsAPI.getPayments();
      setMyPayments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading payments:', error);
      setMyPayments([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const validatePaymentForm = () => {
    if (!formData.payment_type) {
      showError('Please select payment type');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showError('Please enter valid amount');
      return false;
    }
    if (!formData.payment_method) {
      showError('Please select payment method');
      return false;
    }
    if (!file) {
      showError('Please upload payment proof');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePaymentForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const submitData = new FormData();
      
      console.log('Submitting payment:', formData, file);
      
      // Add all form fields
      submitData.append('payment_type', formData.payment_type);
      submitData.append('amount', formData.amount);
      submitData.append('payment_method', formData.payment_method);
      
      if (formData.description) {
        submitData.append('description', formData.description);
      }
      if (formData.transaction_id) {
        submitData.append('transaction_id', formData.transaction_id);
      }
      
      // Add file
      submitData.append('payment_proof', file);

      // Debug: Log FormData contents
      console.log('Payment FormData contents:');
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      const response = await paymentsAPI.createPayment(submitData);
      console.log('Payment response:', response);
      
      showSuccess('Payment submitted successfully! Admin will review and approve.');
      
      setFormData({
        payment_type: 'activation_fee',
        amount: '',
        description: '',
        payment_method: '',
        transaction_id: ''
      });
      setFile(null);
      setShowForm(false);
      loadMyPayments();
    } catch (error) {
      console.error('Payment error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMsg = error.response?.data ? 
        JSON.stringify(error.response.data, null, 2) : 
        'Failed to submit payment. Please try again.';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      approved: 'bg-success',
      rejected: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>💳 My Payments</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'View My Payments' : '+ Submit Payment'}
        </button>
      </div>

      {showForm ? (
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="application-form">
              <form onSubmit={handleSubmit}>
                <h4>Submit Payment</h4>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Payment Type *</label>
                    <select 
                      className="form-select" 
                      name="payment_type"
                      value={formData.payment_type} 
                      onChange={handleInputChange}
                      required
                    >
                      {Object.entries(paymentTypes).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Amount ($) *</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Payment Method *</label>
                    <select 
                      className="form-select" 
                      name="payment_method"
                      value={formData.payment_method} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select method...</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="cash">Cash</option>
                      <option value="check">Check</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Transaction ID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="transaction_id"
                      value={formData.transaction_id}
                      onChange={handleInputChange}
                      placeholder="Reference number"
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-control" 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Payment details..."
                    ></textarea>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Payment Proof *</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    <div className="form-text">Upload receipt or proof of payment</div>
                  </div>
                  
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Payment'}
                    </button>
                    <button type="button" className="btn btn-secondary ms-2" onClick={() => setShowForm(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            {myPayments.length === 0 ? (
              <div className="text-center py-5">
                <h5>No payments submitted yet</h5>
                <p>Click "Submit Payment" to get started</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Payment Type</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Admin Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(myPayments) && myPayments.map(payment => (
                      <tr key={payment.id}>
                        <td>{paymentTypes[payment.payment_type]}</td>
                        <td>${payment.amount}</td>
                        <td>{payment.payment_method}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                        <td>{payment.admin_notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        isVisible={snackbar.show}
        onClose={hideSnackbar}
      />
    </div>
  );
};

export default Payments;