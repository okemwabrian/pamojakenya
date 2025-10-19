import React, { useState, useEffect } from 'react';
import { sharesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Shares = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    shares: '',
    paymentMethod: '',
    comments: ''
  });
  const [shareHistory, setShareHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || ''
      }));
      fetchShareHistory();
    }
  }, [isAuthenticated, user]);

  const fetchShareHistory = async () => {
    try {
      const response = await sharesAPI.getShares();
      setShareHistory(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Error fetching share history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sharesAPI.buyShares({
        amount: parseFloat(totalAmount),
        payment_method: formData.paymentMethod,
        shares_purchased: parseInt(formData.shares),
        notes: formData.comments
      });
      alert('Shares purchase initiated successfully!');
      setFormData(prev => ({ ...prev, shares: '', paymentMethod: '', comments: '' }));
      fetchShareHistory();
    } catch (error) {
      console.error('Error purchasing shares:', error);
      alert('Error purchasing shares. Please try again.');
    }
  };

  const totalAmount = formData.shares ? (formData.shares * 100).toFixed(2) : '0.00';

  return (
    <div className="container my-5">
      {/* Current Shares Summary */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h3>{user?.shares_owned || 0}</h3>
              <p className="mb-0">Current Shares</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h3>${((user?.shares_owned || 0) * 100).toFixed(2)}</h3>
              <p className="mb-0">Total Investment</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h3>{shareHistory.length}</h3>
              <p className="mb-0">Transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <div className="card shadow-lg">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">Purchase New Shares</h4>
            </div>
            <div className="card-body">

      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="mb-4">
          <label htmlFor="fullName" className="form-label fw-semibold">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="form-control border border-success shadow-sm"
            placeholder="Enter your full name"
            required
            disabled={isAuthenticated}
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="form-label fw-semibold">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control border border-success shadow-sm"
            placeholder="Enter your email"
            required
            disabled={isAuthenticated}
          />
        </div>

        {/* Number of Shares */}
        <div className="mb-4">
          <label htmlFor="shares" className="form-label fw-semibold">Number of Shares</label>
          <input
            type="number"
            id="shares"
            name="shares"
            value={formData.shares}
            onChange={handleChange}
            className="form-control border border-success shadow-sm"
            required
            min="1"
            placeholder="Enter number of shares"
          />
        </div>

        {/* Payment Method */}
        <div className="mb-4">
          <label htmlFor="paymentMethod" className="form-label fw-semibold">Preferred Payment Method</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="form-select border border-success shadow-sm"
            required
          >
            <option value="" disabled>Select payment method</option>
            <option value="paypal">PayPal</option>
            <option value="bank">Bank Transfer</option>
            <option value="card">Credit/Debit Card</option>
          </select>
        </div>

        {/* Comments */}
        <div className="mb-4">
          <label htmlFor="comments" className="form-label fw-semibold">Additional Notes (Optional)</label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows="4"
            className="form-control border border-success shadow-sm"
            placeholder="Your notes here..."
          />
        </div>

        {/* Payment Summary */}
        <div className="mb-4 p-3 rounded" style={{backgroundColor: '#f2fdf6', borderLeft: '6px solid #007A3D'}}>
          <p className="mb-1 fw-semibold">
            <span>Total Payment:</span>
            <span className="text-danger"> ${totalAmount}</span>
          </p>
          <p className="text-muted mb-0">(1 Share = $100.00)</p>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="btn btn-success btn-lg px-5 py-2 fw-bold"
          >
            Purchase Shares
          </button>
        </div>
      </form>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Share Purchase History</h4>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status"></div>
                </div>
              ) : shareHistory.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-piggy-bank display-1 text-muted"></i>
                  <h5 className="mt-3">No Share Purchases Yet</h5>
                  <p className="text-muted">Your share purchase history will appear here.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Shares</th>
                        <th>Amount</th>
                        <th>Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shareHistory.map(share => (
                        <tr key={share.id}>
                          <td>{new Date(share.created_at).toLocaleDateString()}</td>
                          <td><span className="badge bg-primary">{share.shares_purchased}</span></td>
                          <td className="fw-bold text-success">${share.amount}</td>
                          <td>
                            <span className={`badge ${
                              share.payment_method === 'paypal' ? 'bg-info' :
                              share.payment_method === 'bank' ? 'bg-warning' : 'bg-secondary'
                            }`}>
                              {share.payment_method}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shares;