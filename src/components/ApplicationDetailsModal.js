import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const ApplicationDetailsModal = ({ applicationId, isOpen, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchDetails();
    }
  }, [isOpen, applicationId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getApplicationDetails(applicationId);
      setDetails(response.data);
    } catch (err) {
      console.error('Error fetching application details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">📋 Application Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status"></div>
              </div>
            ) : details ? (
              <div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6>👤 User Information</h6>
                    <p><strong>Username:</strong> {details.user.username}</p>
                    <p><strong>Email:</strong> {details.user.email}</p>
                    <p><strong>Full Name:</strong> {details.user.full_name}</p>
                    <p><strong>Phone:</strong> {details.user.phone}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>📝 Application Info</h6>
                    <p><strong>Type:</strong> {details.application_type}</p>
                    <p><strong>Status:</strong> 
                      <span className={`badge ms-2 ${
                        details.status === 'approved' ? 'bg-success' :
                        details.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                      }`}>
                        {details.status}
                      </span>
                    </p>
                    <p><strong>Applied:</strong> {new Date(details.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {details.personal_details && (
                  <div className="mb-3">
                    <h6>🏠 Personal Details</h6>
                    <div className="bg-light p-3 rounded">
                      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                        {JSON.stringify(details.personal_details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {details.spouse_details && (
                  <div className="mb-3">
                    <h6>💑 Spouse Details</h6>
                    <div className="bg-light p-3 rounded">
                      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                        {JSON.stringify(details.spouse_details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <h6>💳 Payment Information</h6>
                  {details.payment_reference && (
                    <p><strong>Reference ID:</strong> {details.payment_reference}</p>
                  )}
                  {details.payment_proof ? (
                    <div>
                      <p><strong>Payment Proof:</strong></p>
                      <a 
                        href={details.payment_proof} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="bi bi-file-earmark me-1"></i>View Payment Proof
                      </a>
                    </div>
                  ) : (
                    <p className="text-muted">No payment proof uploaded</p>
                  )}
                </div>
              </div>
            ) : (
              <p>No details available</p>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;