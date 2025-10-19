import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ErrorMessage from '../ErrorMessage';
import SuccessMessage from '../SuccessMessage';

const EnhancedClaims = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [claimData, setClaimData] = useState({
    claim_type: 'death',
    member_name: '',
    relationship: '',
    amount_requested: '',
    incident_date: '',
    description: '',
    supporting_documents: null
  });

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await api.get('/claims/');
      setClaims(response.data.results || response.data || []);
    } catch (error) {
      setError('Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClaimData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setClaimData(prev => ({
      ...prev,
      supporting_documents: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    Object.keys(claimData).forEach(key => {
      if (claimData[key] !== null && claimData[key] !== '') {
        formData.append(key, claimData[key]);
      }
    });

    try {
      await api.post('/claims/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('Claim submitted successfully! You will receive email notifications about status updates.');
      setClaimData({
        claim_type: 'death',
        member_name: '',
        relationship: '',
        amount_requested: '',
        incident_date: '',
        description: '',
        supporting_documents: null
      });
      
      // Reset file input
      const fileInput = document.getElementById('supporting_documents');
      if (fileInput) fileInput.value = '';
      
      setShowForm(false);
      fetchClaims();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit claim');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      case 'pending':
      default:
        return 'bg-warning';
    }
  };

  if (loading) return <div className="text-center">Loading claims...</div>;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>My Claims</h4>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : 'Submit New Claim'}
            </button>
          </div>
          
          <ErrorMessage message={error} onClose={() => setError('')} />
          <SuccessMessage message={success} onClose={() => setSuccess('')} />

          {/* New Claim Form */}
          {showForm && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Submit New Claim</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Claim Type *</label>
                        <select
                          className="form-select"
                          name="claim_type"
                          value={claimData.claim_type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="death">Death Benefit</option>
                          <option value="medical">Medical</option>
                          <option value="education">Education</option>
                          <option value="emergency">Emergency</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Member Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="member_name"
                          value={claimData.member_name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Relationship *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="relationship"
                          value={claimData.relationship}
                          onChange={handleInputChange}
                          placeholder="e.g., Spouse, Child, Parent"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Amount Requested *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="amount_requested"
                          value={claimData.amount_requested}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Incident Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="incident_date"
                      value={claimData.incident_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={claimData.description}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Provide detailed description of the claim"
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Supporting Documents *</label>
                    <input
                      type="file"
                      className="form-control"
                      id="supporting_documents"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileChange}
                      required
                    />
                    <small className="text-muted">
                      Upload supporting documents (death certificate, medical reports, etc.)
                    </small>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      Submit Claim
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Claims List */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">My Claims History</h5>
            </div>
            <div className="card-body">
              {claims.length > 0 ? (
                <div className="row">
                  {claims.map(claim => (
                    <div key={claim.id} className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title">{claim.member_name}</h6>
                            <span className={`badge ${getStatusBadge(claim.status)}`}>
                              {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                            </span>
                          </div>
                          
                          <p className="card-text">
                            <strong>Type:</strong> {claim.claim_type}<br/>
                            <strong>Relationship:</strong> {claim.relationship}<br/>
                            <strong>Amount:</strong> ${claim.amount_requested}<br/>
                            <strong>Date:</strong> {new Date(claim.incident_date).toLocaleDateString()}<br/>
                            <strong>Submitted:</strong> {new Date(claim.created_at).toLocaleDateString()}
                          </p>
                          
                          {claim.status === 'pending' && (
                            <div className="alert alert-info">
                              <small>
                                <i className="bi bi-clock me-1"></i>
                                Your claim is being reviewed. You will receive email notifications about any updates.
                              </small>
                            </div>
                          )}
                          
                          {claim.status === 'approved' && claim.amount_approved && (
                            <div className="alert alert-success">
                              <small>
                                <i className="bi bi-check-circle me-1"></i>
                                Approved for ${claim.amount_approved}
                              </small>
                            </div>
                          )}
                          
                          {claim.status === 'rejected' && (
                            <div className="alert alert-danger">
                              <small>
                                <i className="bi bi-x-circle me-1"></i>
                                Claim was rejected
                              </small>
                            </div>
                          )}
                          
                          {claim.admin_notes && (
                            <div className="mt-2">
                              <small className="text-muted">
                                <strong>Admin Notes:</strong> {claim.admin_notes}
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-heart-pulse display-4 text-muted mb-3"></i>
                  <p className="text-muted">No claims submitted yet.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowForm(true)}
                  >
                    Submit Your First Claim
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedClaims;