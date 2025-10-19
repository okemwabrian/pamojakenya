import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ErrorMessage from '../ErrorMessage';
import SuccessMessage from '../SuccessMessage';

const EnhancedShares = () => {
  const { user } = useAuth();
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [purchaseData, setPurchaseData] = useState({
    shares_purchased: '',
    amount: '',
    payment_method: 'bank_transfer',
    payment_reference: '',
    notes: '',
    evidence_file: null
  });

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    try {
      const response = await api.get('/shares/');
      setShares(response.data.results || response.data || []);
    } catch (error) {
      setError('Failed to fetch shares data');
    } finally {
      setLoading(false);
    }
  };

  const getSharesColor = () => {
    if (!user?.is_active) return 'text-secondary';
    if ((user?.shares_owned || 0) < 25) return 'text-danger';
    return 'text-success';
  };

  const getSharesStatus = () => {
    if (!user?.is_active) return 'Account Inactive';
    if ((user?.shares_owned || 0) < 20) return 'Critical Low - Account may be deactivated';
    if ((user?.shares_owned || 0) < 25) return 'Low Balance - Consider purchasing more shares';
    return 'Good Balance';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPurchaseData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-calculate amount when shares change
    if (name === 'shares_purchased') {
      const amount = parseInt(value) * 100; // $100 per share
      setPurchaseData(prev => ({
        ...prev,
        amount: amount.toString()
      }));
    }
  };

  const handleFileChange = (e) => {
    setPurchaseData(prev => ({
      ...prev,
      evidence_file: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!purchaseData.shares_purchased || !purchaseData.amount || !purchaseData.payment_reference) {
      setError('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    Object.keys(purchaseData).forEach(key => {
      if (purchaseData[key] !== null && purchaseData[key] !== '') {
        formData.append(key, purchaseData[key]);
      }
    });

    try {
      await api.post('/shares/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('Share purchase submitted successfully! Admin has been notified and will update your account once payment is verified.');
      setPurchaseData({
        shares_purchased: '',
        amount: '',
        payment_method: 'bank_transfer',
        payment_reference: '',
        notes: '',
        evidence_file: null
      });
      
      // Reset file input
      const fileInput = document.getElementById('evidence_file');
      if (fileInput) fileInput.value = '';
      
      fetchShares();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit share purchase');
    }
  };

  if (loading) return <div className="text-center">Loading shares data...</div>;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h4 className="mb-4">My Shares</h4>
          
          <ErrorMessage message={error} onClose={() => setError('')} />
          <SuccessMessage message={success} onClose={() => setSuccess('')} />

          {/* Current Shares Status */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Current Shares Balance</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="text-center p-3 bg-light rounded">
                    <h2 className={getSharesColor()}>{user?.shares_owned || 0}</h2>
                    <p className="mb-0">Shares Owned</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3 bg-light rounded">
                    <h2 className="text-info">{user?.available_shares || 100}</h2>
                    <p className="mb-0">Available for Purchase</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3 bg-light rounded">
                    <h2 className="text-success">${((user?.shares_owned || 0) * 100).toLocaleString()}</h2>
                    <p className="mb-0">Total Value</p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className={`alert ${
                  !user?.is_active ? 'alert-secondary' :
                  (user?.shares_owned || 0) < 20 ? 'alert-danger' :
                  (user?.shares_owned || 0) < 25 ? 'alert-warning' : 'alert-success'
                }`}>
                  <strong>Status:</strong> {getSharesStatus()}
                </div>
              </div>
            </div>
          </div>

          {/* Purchase New Shares */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Purchase Additional Shares</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Number of Shares *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="shares_purchased"
                        value={purchaseData.shares_purchased}
                        onChange={handleInputChange}
                        min="1"
                        max={user?.available_shares || 100}
                        required
                      />
                      <small className="text-muted">Price: $100 per share</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Total Amount *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="amount"
                        value={purchaseData.amount}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Payment Method *</label>
                      <select
                        className="form-select"
                        name="payment_method"
                        value={purchaseData.payment_method}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="check">Check</option>
                        <option value="cash">Cash</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Payment Reference/Transaction ID *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="payment_reference"
                        value={purchaseData.payment_reference}
                        onChange={handleInputChange}
                        placeholder="Enter transaction ID or reference"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Payment Evidence (Screenshot/Receipt)</label>
                  <input
                    type="file"
                    className="form-control"
                    id="evidence_file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                  />
                  <small className="text-muted">Upload screenshot or receipt of payment</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Additional Notes</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    value={purchaseData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Any additional information about the payment"
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit Purchase Request
                </button>
              </form>
            </div>
          </div>

          {/* Purchase History */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Purchase History</h5>
            </div>
            <div className="card-body">
              {shares.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Shares</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Reference</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shares.map(share => (
                        <tr key={share.id}>
                          <td>{new Date(share.created_at).toLocaleDateString()}</td>
                          <td>{share.shares_purchased}</td>
                          <td>${share.amount}</td>
                          <td>{share.payment_method}</td>
                          <td>{share.payment_reference}</td>
                          <td>
                            <span className={`badge ${
                              share.status === 'completed' ? 'bg-success' :
                              share.status === 'pending' ? 'bg-warning' : 'bg-secondary'
                            }`}>
                              {share.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No share purchases yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedShares;