import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await adminAPI.getApplications();
      setApplications(response.data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationDetails = async (id) => {
    try {
      const response = await adminAPI.getApplicationDetails(id);
      setSelectedApp(response.data);
      setShowDetails(true);
    } catch (err) {
      console.error('Error fetching application details:', err);
    }
  };

  const handleApprove = async (id, userName) => {
    if (window.confirm(`✅ Approve membership application for ${userName}?`)) {
      try {
        await adminAPI.approveApplication(id);
        setApplications(prev => prev.map(app => 
          app.id === id ? { ...app, status: 'approved' } : app
        ));
        alert(`✅ Application approved for ${userName}!`);
      } catch (err) {
        alert('❌ Error approving application');
      }
    }
  };

  const handleReject = async (id, userName) => {
    const reason = prompt(`❌ Rejection reason for ${userName}'s application:`);
    if (reason && reason.trim()) {
      try {
        await adminAPI.rejectApplication(id);
        setApplications(prev => prev.map(app => 
          app.id === id ? { ...app, status: 'rejected', rejection_reason: reason } : app
        ));
        alert(`❌ Application rejected for ${userName}`);
      } catch (err) {
        alert('❌ Error rejecting application');
      }
    }
  };

  const filteredApplications = applications.filter(app => 
    filter === 'all' ? true : app.status === filter
  );

  const getStatusCount = (status) => 
    applications.filter(app => app.status === status).length;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">📋 Membership Applications</h3>
      </div>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending Review ({getStatusCount('pending')})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({getStatusCount('approved')})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({getStatusCount('rejected')})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Applications ({applications.length})
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Membership Type</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map(app => (
                <tr key={app.id}>
                  <td>
                    <strong>{app.full_name}</strong>
                    <small className="d-block text-muted">ID: {app.national_id}</small>
                    {app.spouse_name && (
                      <small className="d-block text-info">Spouse: {app.spouse_name}</small>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      app.membership_type === 'single' ? 'bg-primary' : 'bg-info'
                    }`}>
                      {app.membership_type === 'single' ? 'Single' : 'Double'} Membership
                    </span>
                  </td>
                  <td>
                    <div>{app.email}</div>
                    <small className="text-muted">{app.phone_number}</small>
                    <small className="d-block text-muted">{app.address}</small>
                  </td>
                  <td>
                    <span className={`badge ${
                      app.status === 'approved' ? 'bg-success' :
                      app.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                    }`}>
                      {app.status === 'pending' ? 'Pending Review' :
                       app.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                    {app.rejection_reason && (
                      <small className="d-block text-danger mt-1">
                        Reason: {app.rejection_reason}
                      </small>
                    )}
                  </td>
                  <td>
                    {new Date(app.created_at).toLocaleDateString()}
                    <small className="d-block text-muted">
                      {new Date(app.created_at).toLocaleTimeString()}
                    </small>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-outline-info"
                        onClick={() => fetchApplicationDetails(app.id)}
                      >
                        <i className="bi bi-eye me-1"></i>Details
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-outline-success"
                            onClick={() => handleApprove(app.id, app.full_name)}
                          >
                            <i className="bi bi-check me-1"></i>Approve
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleReject(app.id, app.full_name)}
                          >
                            <i className="bi bi-x me-1"></i>Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Application Details Modal */}
      {showDetails && selectedApp && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Application Details - {selectedApp.application?.full_name}</h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowDetails(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Personal Information</h6>
                    <p><strong>Full Name:</strong> {selectedApp.application?.full_name}</p>
                    <p><strong>National ID:</strong> {selectedApp.application?.national_id}</p>
                    <p><strong>Date of Birth:</strong> {selectedApp.application?.date_of_birth}</p>
                    <p><strong>Gender:</strong> {selectedApp.application?.gender}</p>
                    <p><strong>Occupation:</strong> {selectedApp.application?.occupation}</p>
                    {selectedApp.application?.spouse_name && (
                      <>
                        <h6 className="mt-3">Spouse Information</h6>
                        <p><strong>Spouse Name:</strong> {selectedApp.application?.spouse_name}</p>
                        <p><strong>Spouse ID:</strong> {selectedApp.application?.spouse_national_id}</p>
                        <p><strong>Spouse DOB:</strong> {selectedApp.application?.spouse_date_of_birth}</p>
                      </>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h6>Contact Information</h6>
                    <p><strong>Email:</strong> {selectedApp.application?.email}</p>
                    <p><strong>Phone:</strong> {selectedApp.application?.phone_number}</p>
                    <p><strong>Address:</strong> {selectedApp.application?.address}</p>
                    
                    <h6 className="mt-3">Emergency Contact</h6>
                    <p><strong>Name:</strong> {selectedApp.application?.emergency_contact_name}</p>
                    <p><strong>Phone:</strong> {selectedApp.application?.emergency_contact_phone}</p>
                    <p><strong>Relationship:</strong> {selectedApp.application?.emergency_contact_relationship}</p>
                  </div>
                </div>
                
                {selectedApp.documents && selectedApp.documents.length > 0 && (
                  <div className="mt-4">
                    <h6>Submitted Documents</h6>
                    <div className="list-group">
                      {selectedApp.documents.map(doc => (
                        <div key={doc.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{doc.name}</strong>
                            <small className="d-block text-muted">{doc.document_type}</small>
                          </div>
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => window.open(doc.file_url, '_blank')}
                          >
                            <i className="bi bi-download me-1"></i>View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredApplications.length === 0 && !loading && (
        <div className="text-center py-5">
          <i className="bi bi-file-text display-1 text-muted"></i>
          <h4 className="text-muted mt-3">No Applications</h4>
          <p className="text-muted">No membership applications found for the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;