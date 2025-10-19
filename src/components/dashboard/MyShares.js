import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sharesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Snackbar from '../Snackbar';
import { useSnackbar } from '../../hooks/useSnackbar';
import PaymentInstructions from '../PaymentInstructions';

const MyShares = () => {
  const { user } = useAuth();
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const [shareHistory, setShareHistory] = useState([]);
  const [sharePrice] = useState(100.00);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '50',
    paymentMethod: '',
    transactionId: '',
    notes: ''
  });
  const [evidenceFile, setEvidenceFile] = useState(null);

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    try {
      const response = await sharesAPI.getShares();
      const shares = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setShareHistory(shares);
    } catch (error) {
      console.error('Error fetching shares:', error);
      setShareHistory([]);
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
    if (!formData.paymentMethod || !formData.transactionId || !formData.amount) {
      showError('Please fill in all required fields');
      return;
    }
    
    if (!evidenceFile) {
      showError('Please upload payment evidence (receipt/screenshot)');
      return;
    }
    
    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('amount', formData.amount);
      submitData.append('payment_method', formData.paymentMethod);
      submitData.append('transaction_id', formData.transactionId);
      submitData.append('notes', formData.notes);
      submitData.append('shares_requested', Math.floor(formData.amount / sharePrice));
      submitData.append('evidence_file', evidenceFile);
      
      await sharesAPI.buyShares(submitData);
      showSuccess(`🎉 Share purchase request submitted successfully! You requested ${Math.floor(formData.amount / sharePrice)} shares worth $${formData.amount}. Admin will verify your payment and assign shares within 24-48 hours.`);
      fetchShares();
      setFormData({ amount: '50', paymentMethod: '', transactionId: '', notes: '' });
      setEvidenceFile(null);
    } catch (error) {
      console.error('Error buying shares:', error);
      showError('Error submitting share purchase request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const sharesCount = formData.amount ? Math.floor(formData.amount / sharePrice) : 0;
  const currentSharesValue = user?.shares_owned || 0;
  const totalInvestment = shareHistory.filter(s => s.status === 'approved').reduce((sum, share) => sum + (parseFloat(share.amount) || 0), 0);

  return (
    <div className="container-fluid">
      <div className="row g-4">
        {/* Summary Cards */}
        <div className="col-12">
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card bg-primary text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-piggy-bank display-4 mb-2"></i>
                  <h3>{currentSharesValue}</h3>
                  <p className="mb-0">My Shares</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-success text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-currency-dollar display-4 mb-2"></i>
                  <h3>${totalInvestment.toFixed(2)}</h3>
                  <p className="mb-0">Total Investment</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-info text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-graph-up display-4 mb-2"></i>
                  <h3>${sharePrice}</h3>
                  <p className="mb-0">Price per Share</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buy Shares Form */}
        <div className="col-lg-8">
          <div className="card shadow-lg">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0"><i className="bi bi-plus-circle me-2"></i>Buy Additional Shares</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Amount to Invest ($) *</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="Enter amount (minimum $50)"
                      min="50" 
                      step="10"
                      required
                    />
                    {formData.amount && (
                      <div className="form-text text-success">
                        <i className="bi bi-info-circle me-1"></i>
                        You will receive <strong>{sharesCount}</strong> shares for ${formData.amount}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Payment Method *</label>
                    <select 
                      className="form-select" 
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select payment method...</option>
                      <option value="paypal">PayPal</option>
                      <option value="mpesa">M-Pesa</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                {/* Payment Instructions */}
                {formData.paymentMethod && (
                  <PaymentInstructions 
                    paymentMethod={formData.paymentMethod} 
                    amount={formData.amount} 
                  />
                )}

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Payment Reference/Transaction ID *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleChange}
                      placeholder="Enter transaction ID or reference number"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Amount Paid</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.amount}
                      readOnly
                      style={{backgroundColor: '#f8f9fa'}}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Payment Evidence (Receipt/Screenshot) *</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*,.pdf"
                    onChange={(e) => setEvidenceFile(e.target.files[0])}
                    required
                  />
                  <div className="form-text">
                    Upload receipt, screenshot, or confirmation document
                  </div>
                  {evidenceFile && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <i className="bi bi-file-earmark-check text-success me-2"></i>
                      <strong>Selected:</strong> {evidenceFile.name}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Additional Notes (Optional)</label>
                  <textarea 
                    className="form-control" 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any additional information..."
                  />
                </div>

                <div className="alert alert-warning mb-3">
                  <small>
                    <i className="bi bi-clock me-1"></i>
                    After submitting, admin will verify your payment and activate your shares within 24-48 hours.
                  </small>
                </div>
                
                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-success btn-lg" 
                    disabled={!formData.amount || !formData.paymentMethod || !formData.transactionId || submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-1"></i>
                        Submit Purchase Request - ${formData.amount || '0.00'}
                      </>
                    )}
                  </button>
                  <Link to="/shares" className="btn btn-outline-primary btn-lg">
                    <i className="bi bi-arrow-right me-1"></i>
                    Advanced Purchase
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Share History */}
        <div className="col-lg-4">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0"><i className="bi bi-clock-history me-2"></i>Share Purchase History</h5>
            </div>
            <div className="card-body" style={{maxHeight: '500px', overflowY: 'auto'}}>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status"></div>
                </div>
              ) : shareHistory.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-piggy-bank display-1 text-muted"></i>
                  <h6 className="mt-3">No Share Purchases Yet</h6>
                  <p className="text-muted small">Your share purchase history will appear here.</p>
                </div>
              ) : (
                <div className="timeline">
                  {shareHistory.map((share, index) => (
                    <div key={share.id} className="mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1">${share.amount}</h6>
                          <small className="text-muted">
                            {new Date(share.created_at).toLocaleDateString()}
                          </small>
                        </div>
                        <span className={`badge ${
                          share.status === 'approved' ? 'bg-success' :
                          share.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                        }`}>
                          {share.status === 'pending' ? 'Under Review' : share.status}
                        </span>
                      </div>
                      <div className="small">
                        <div><strong>Shares:</strong> {share.shares_requested || Math.floor(share.amount / sharePrice)}</div>
                        <div><strong>Method:</strong> {share.payment_method}</div>
                        {share.transaction_id && (
                          <div><strong>Ref:</strong> {share.transaction_id}</div>
                        )}
                        {share.admin_notes && (
                          <div className="mt-1 text-info">
                            <strong>Admin Note:</strong> {share.admin_notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        show={snackbar.show}
        onClose={hideSnackbar}
      />
    </div>
  );
};

export default MyShares;