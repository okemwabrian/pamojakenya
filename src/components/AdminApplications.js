import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useSnackbar } from '../hooks/useSnackbar';
import Snackbar from './Snackbar';

const AdminApplications = () => {
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadApplications();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadApplications = async () => {
    try {
      const response = await adminAPI.getApplications();
      setApplications(response.data);
    } catch (error) {
      console.error('Error loading applications:', error);
      showError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (app, action) => {
    setSelectedApp(app);
    setActionType(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    try {
      if (actionType === 'approve') {
        await adminAPI.approveApplication(selectedApp.id, { notes });
        showSuccess('Application approved successfully');
      } else if (actionType === 'reject') {
        await adminAPI.rejectApplication(selectedApp.id, { notes });
        showSuccess('Application rejected');
      } else if (actionType === 'delete') {
        await adminAPI.deleteApplication(selectedApp.id);
        showSuccess('Application deleted');
      }
      
      setShowModal(false);
      setNotes('');
      loadApplications();
    } catch (error) {
      console.error('Action error:', error);
      showError('Failed to process action');
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

  const viewDetails = (app) => {
    setSelectedApp(app);
    setActionType('view');
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status"></div>
        <p className="mt-2">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>📋 Membership Applications</h3>
        <div className="badge bg-primary fs-6">
          Total: {applications.length}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {applications.length === 0 ? (
            <div className="text-center py-5">
              <h5>No applications found</h5>
              <p className="text-muted">Applications will appear here when submitted</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Email</th>
                    <th>Membership Type</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id}>
                      <td>
                        <strong>{app.first_name} {app.last_name}</strong>
                        {app.membership_type === 'double' && app.spouse_first_name && (
                          <div className="small text-muted">
                            Spouse: {app.spouse_first_name} {app.spouse_last_name}
                          </div>
                        )}
                      </td>
                      <td>{app.email}</td>
                      <td>
                        <span className={`badge ${app.membership_type === 'double' ? 'bg-info' : 'bg-primary'}`}>
                          {app.membership_type === 'double' ? '👥 Double' : '👤 Single'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td>{new Date(app.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-info"
                            onClick={() => viewDetails(app)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {app.status === 'pending' && (
                            <>
                              <button 
                                className="btn btn-outline-success"
                                onClick={() => handleAction(app, 'approve')}
                              >
                                <i className="bi bi-check"></i>
                              </button>
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => handleAction(app, 'reject')}
                              >
                                <i className="bi bi-x"></i>
                              </button>
                            </>
                          )}
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleAction(app, 'delete')}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {actionType === 'view' ? 'Application Details' : 
                   actionType === 'approve' ? 'Approve Application' :
                   actionType === 'reject' ? 'Reject Application' : 'Delete Application'}
                </h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {actionType === 'view' ? (
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Primary Applicant</h6>
                      <p><strong>Name:</strong> {selectedApp.first_name} {selectedApp.last_name}</p>
                      <p><strong>Email:</strong> {selectedApp.email}</p>
                      <p><strong>Phone:</strong> {selectedApp.phone}</p>
                      <p><strong>DOB:</strong> {selectedApp.date_of_birth}</p>
                      <p><strong>ID Number:</strong> {selectedApp.id_number}</p>
                      <p><strong>Address:</strong> {selectedApp.address}, {selectedApp.city}, {selectedApp.state} {selectedApp.zip_code}</p>
                      
                      <h6 className="mt-3">Emergency Contact</h6>
                      <p><strong>Name:</strong> {selectedApp.emergency_name}</p>
                      <p><strong>Phone:</strong> {selectedApp.emergency_phone}</p>
                      <p><strong>Relationship:</strong> {selectedApp.emergency_relationship}</p>
                    </div>
                    
                    {selectedApp.membership_type === 'double' && (
                      <div className="col-md-6">
                        <h6>Spouse Information</h6>
                        <p><strong>Name:</strong> {selectedApp.spouse_first_name} {selectedApp.spouse_last_name}</p>
                        <p><strong>Email:</strong> {selectedApp.spouse_email}</p>
                        <p><strong>Phone:</strong> {selectedApp.spouse_phone}</p>
                        <p><strong>DOB:</strong> {selectedApp.spouse_date_of_birth}</p>
                        <p><strong>ID Number:</strong> {selectedApp.spouse_id_number}</p>
                      </div>
                    )}
                    
                    {selectedApp.children_info && selectedApp.children_info.length > 0 && (
                      <div className="col-12">
                        <h6>Children Information</h6>
                        {JSON.parse(selectedApp.children_info || '[]').map((child, index) => (
                          <div key={index} className="border p-2 mb-2 rounded">
                            <p><strong>Name:</strong> {child.name}</p>
                            <p><strong>DOB:</strong> {child.date_of_birth}</p>
                            <p><strong>Relationship:</strong> {child.relationship}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="col-12">
                      <h6>Documents</h6>
                      {selectedApp.id_document && (
                        <p><a href={selectedApp.id_document} target="_blank" rel="noopener noreferrer">
                          📄 Primary ID Document
                        </a></p>
                      )}
                      {selectedApp.spouse_id_document && (
                        <p><a href={selectedApp.spouse_id_document} target="_blank" rel="noopener noreferrer">
                          📄 Spouse ID Document
                        </a></p>
                      )}
                      {selectedApp.payment_proof && (
                        <p><a href={selectedApp.payment_proof} target="_blank" rel="noopener noreferrer">
                          💳 Payment Proof
                        </a></p>
                      )}
                    </div>
                    
                    {selectedApp.admin_notes && (
                      <div className="col-12">
                        <h6>Admin Notes</h6>
                        <p className="alert alert-info">{selectedApp.admin_notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p>
                      {actionType === 'approve' ? 'Are you sure you want to approve this application?' :
                       actionType === 'reject' ? 'Are you sure you want to reject this application?' :
                       'Are you sure you want to delete this application? This action cannot be undone.'}
                    </p>
                    
                    <p><strong>Applicant:</strong> {selectedApp.first_name} {selectedApp.last_name}</p>
                    <p><strong>Type:</strong> {selectedApp.membership_type}</p>
                    
                    {actionType !== 'delete' && (
                      <div className="mb-3">
                        <label className="form-label">Notes (Optional)</label>
                        <textarea 
                          className="form-control" 
                          rows="3"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add any notes or comments..."
                        ></textarea>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  {actionType === 'view' ? 'Close' : 'Cancel'}
                </button>
                {actionType !== 'view' && (
                  <button 
                    className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                    onClick={confirmAction}
                  >
                    {actionType === 'approve' ? 'Approve' : 
                     actionType === 'reject' ? 'Reject' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
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

export default AdminApplications;