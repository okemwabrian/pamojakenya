import React, { useState, useEffect } from 'react';
import { claimsAPI } from '../services/api';
import { useSnackbar } from '../hooks/useSnackbar';
import Snackbar from './Snackbar';

const Claims = () => {
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    claim_type: '', member_name: '', relationship: '', incident_date: '',
    amount_requested: '', description: '', supporting_documents: null
  });
  const [loading, setLoading] = useState(false);
  const [myClaims, setMyClaims] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const claimTypes = {
    death: 'Death Benefit', medical: 'Medical Emergency',
    education: 'Education Support', emergency: 'Emergency Assistance'
  };

  useEffect(() => {
    loadMyClaims();
  }, []);

  const loadMyClaims = async () => {
    try {
      const response = await claimsAPI.getClaims();
      setMyClaims(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading claims:', error);
      setMyClaims([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({ ...formData, [name]: type === 'file' ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      
      await claimsAPI.createClaim(submitData);
      showSuccess('Claim submitted successfully! We will review and contact you within 5 business days.');
      setFormData({
        claim_type: '', member_name: '', relationship: '', incident_date: '',
        amount_requested: '', description: '', supporting_documents: null
      });
      setShowForm(false);
      loadMyClaims();
    } catch (err) {
      console.error('Claim submission error:', err);
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.message || 
                      Object.values(err.response?.data || {}).flat().join(', ') ||
                      'Failed to submit claim. Please try again.';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning',
      approved: 'bg-success', 
      rejected: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🎆 My Claims</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'View My Claims' : '+ Submit New Claim'}
        </button>
      </div>

      {showForm ? (
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="application-form">
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-12"><h4>Submit New Claim</h4></div>
                
                <div className="col-md-6">
                  <label className="form-label">Claim Type *</label>
                  <select className="form-select" name="claim_type" value={formData.claim_type} onChange={handleChange} required>
                    <option value="">Select claim type...</option>
                    {Object.entries(claimTypes).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Member Name *</label>
                  <input type="text" className="form-control" name="member_name" value={formData.member_name} onChange={handleChange} required />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Relationship *</label>
                  <select className="form-select" name="relationship" value={formData.relationship} onChange={handleChange} required>
                    <option value="">Select relationship...</option>
                    <option value="self">Self</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Incident Date *</label>
                  <input type="date" className="form-control" name="incident_date" value={formData.incident_date} onChange={handleChange} required />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Amount Requested ($) *</label>
                  <input type="number" className="form-control" name="amount_requested" value={formData.amount_requested} onChange={handleChange} min="1" step="0.01" required />
                </div>
                
                <div className="col-12">
                  <label className="form-label">Description *</label>
                  <textarea className="form-control" rows="4" name="description" value={formData.description} onChange={handleChange} placeholder="Detailed description of incident..." required></textarea>
                </div>
                
                <div className="col-12">
                  <label className="form-label">Supporting Documents</label>
                  <input type="file" className="form-control" name="supporting_documents" onChange={handleChange} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                  <div className="form-text">Upload relevant documents (medical bills, certificates, etc.)</div>
                </div>
                
                <div className="col-12">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Claim'}
                  </button>
                  <button type="button" className="btn btn-secondary ms-2" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            {myClaims.length === 0 ? (
              <div className="text-center py-5">
                <h5>No claims submitted yet</h5>
                <p>Click "Submit New Claim" to get started</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Claim Type</th>
                      <th>Member Name</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date Submitted</th>
                      <th>Admin Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(myClaims) && myClaims.map(claim => (
                      <tr key={claim.id}>
                        <td>{claimTypes[claim.claim_type]}</td>
                        <td>{claim.member_name}</td>
                        <td>${claim.amount_requested}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(claim.status)}`}>
                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                          </span>
                        </td>
                        <td>{new Date(claim.created_at).toLocaleDateString()}</td>
                        <td>{claim.admin_notes || '-'}</td>
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

export default Claims;