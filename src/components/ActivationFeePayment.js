import React, { useState } from 'react';
import { paymentsAPI } from '../services/api';
import Snackbar from './Snackbar';
import { useSnackbar } from '../hooks/useSnackbar';
import PaymentInstructions from './PaymentInstructions';
import { getPaymentOptions } from '../config/paymentMethods';

const ActivationFeePayment = () => {
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    payment_method: '',
    payment_reference: '',
    amount: '50.00',
    notes: ''
  });
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!evidenceFile) {
      showError('Please upload payment evidence (receipt/screenshot)');
      return;
    }
    
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('payment_method', formData.payment_method);
      submitData.append('transaction_id', formData.payment_reference);
      submitData.append('amount', formData.amount);
      submitData.append('notes', formData.notes);
      submitData.append('evidence_file', evidenceFile);
      
      await paymentsAPI.submitActivationFee(submitData);
      
      showSuccess('🎉 Payment submitted successfully! Admin will verify your payment and activate your membership within 24-48 hours. You will receive an email notification once approved.');
      setFormData({ payment_method: '', payment_reference: '', amount: '50.00', notes: '' });
      setEvidenceFile(null);
    } catch (err) {
      showError('❌ Failed to submit payment information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">💳 Activation Fee Payment</h4>
            </div>
            <div className="card-body">


              {formData.payment_method && (
                <PaymentInstructions 
                  paymentMethod={formData.payment_method} 
                  amount={formData.amount} 
                />
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Payment Method *</label>
                  <select 
                    className="form-select" 
                    name="payment_method" 
                    value={formData.payment_method} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">Select payment method...</option>
                    {getPaymentOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Payment Reference/Transaction ID *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="payment_reference"
                    value={formData.payment_reference}
                    onChange={handleChange}
                    placeholder="Enter transaction ID or reference number"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Amount Paid</label>
                  <input
                    type="number"
                    className="form-control"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="50"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Payment Evidence (Receipt/Screenshot) *</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*,.pdf"
                    onChange={(e) => setEvidenceFile(e.target.files[0])}
                    required
                  />
                  <div className="form-text">
                    Upload receipt, screenshot, or confirmation document (Images or PDF)
                  </div>
                  {evidenceFile && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <i className="bi bi-file-earmark-check text-success me-2"></i>
                      <strong>Selected:</strong> {evidenceFile.name}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Additional Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any additional information about your payment..."
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Payment Information'}
                </button>
              </form>

              <div className="mt-3">
                <small className="text-muted">
                  After submitting, admin will verify your payment and activate your membership within 24-48 hours.
                </small>
              </div>
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

export default ActivationFeePayment;