import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimsAPI } from '../../services/api';

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await claimsAPI.getClaims();
      const claims = Array.isArray(response.data) ? response.data : [];
      setClaims(claims);
    } catch (error) {
      console.error('Error fetching claims:', error);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    claim_type: '',
    amount_requested: '',
    description: ''
  });

  const claimTypes = [
    { value: 'death', label: 'Death Benefit' },
    { value: 'medical', label: 'Medical Emergency' },
    { value: 'education', label: 'Education Support' },
    { value: 'emergency', label: 'Emergency Assistance' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await claimsAPI.createClaim(formData);
      setShowForm(false);
      setFormData({ claim_type: '', amount_requested: '', description: '' });
      fetchClaims(); // Refresh claims list
      alert('Claim submitted successfully!');
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert('Error submitting claim. Please try again.');
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">❤️‍🩹 My Claims</h4>
        <div>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => setShowForm(!showForm)}
          >
            <i className="bi bi-plus-circle me-1"></i>
            {showForm ? 'Cancel' : 'New Claim'}
          </button>
        </div>
      </div>
      <div className="card-body">
        {showForm && (
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Submit New Claim</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Claim Type *</label>
                    <select 
                      className="form-select" 
                      name="claim_type"
                      value={formData.claim_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select claim type</option>
                      {claimTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Amount Requested *</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="amount_requested"
                      value={formData.amount_requested}
                      onChange={handleChange}
                      placeholder="Enter amount"
                      min="1" 
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description *</label>
                  <textarea 
                    className="form-control" 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4" 
                    placeholder="Provide detailed description of your claim..."
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-check-circle me-1"></i>Submit Claim
                </button>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status"></div>
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-heart-pulse display-1 text-muted"></i>
            <h5 className="mt-3">No Claims Submitted</h5>
            <p className="text-muted">You haven't submitted any claims yet.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Submit Your First Claim
            </button>
          </div>
        ) : (
          <div className="row g-3">
            {claims.map(claim => (
              <div key={claim.id} className="col-md-6">
                <div className="card h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">{claim.claim_type}</h6>
                    <span className={`badge ${
                      claim.status === 'pending' ? 'bg-warning text-dark' :
                      claim.status === 'approved' ? 'bg-success' : 'bg-danger'
                    }`}>
                      {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>Amount Requested:</strong> ${claim.amount_requested}</p>
                    {claim.amount_approved && (
                      <p><strong>Amount Approved:</strong> ${claim.amount_approved}</p>
                    )}
                    <p><strong>Submitted:</strong> {new Date(claim.created_at).toLocaleDateString()}</p>
                    <p><strong>Description:</strong> {claim.description}</p>
                    {claim.admin_notes && (
                      <div className="alert alert-info">
                        <strong>Admin Notes:</strong> {claim.admin_notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClaims;