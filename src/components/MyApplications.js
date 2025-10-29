import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import { useSnackbar } from '../hooks/useSnackbar';
import Snackbar from './Snackbar';

const MyApplications = () => {
  const { snackbar, showError, hideSnackbar } = useSnackbar();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadApplications = async () => {
    try {
      const response = await applicationAPI.getApplications();
      console.log('Applications API response:', response.data);
      
      // Backend now returns {applications: [...]} format
      const applications = response.data.applications || [];
      console.log('Applications found:', applications.length);
      setApplications(applications);
    } catch (error) {
      console.error('Error loading applications:', error);
      showError('Failed to load applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (app) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      approved: 'bg-success',
      rejected: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status"></div>
          <p className="mt-2">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📋 My Applications</h2>
        <Link to="/membership-application" className="btn btn-primary">
          + New Application
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-5">
          <div className="card">
            <div className="card-body">
              <h4>No Applications Yet</h4>
              <p className="text-muted">You haven't submitted any membership applications.</p>
              <Link to="/membership-application" className="btn btn-primary">
                Apply for Membership
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Application Type</th>
                    <th>Status</th>
                    <th>Submitted Date</th>
                    <th>Admin Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id}>
                      <td>
                        <span className={`badge ${app.membership_type === 'double' ? 'bg-info' : 'bg-primary'}`}>
                          {app.membership_type === 'double' ? '👥 Double' : '👤 Single'} Membership
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td>{new Date(app.created_at).toLocaleDateString()}</td>
                      <td>{app.admin_notes || '-'}</td>
                      <td>
                        <button 
                          className="btn btn-outline-info btn-sm"
                          onClick={() => viewDetails(app)}
                        >
                          <i className="bi bi-eye"></i> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedApp && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Application Details</h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Application Info</h6>
                    <p><strong>Type:</strong> {selectedApp.membership_type} Membership</p>
                    <p><strong>Status:</strong> 
                      <span className={`badge ${getStatusBadge(selectedApp.status)} ms-2`}>
                        {selectedApp.status}
                      </span>
                    </p>
                    <p><strong>Submitted:</strong> {new Date(selectedApp.created_at).toLocaleDateString()}</p>
                    
                    <h6 className="mt-3">Primary Applicant</h6>
                    <p><strong>Name:</strong> {selectedApp.first_name} {selectedApp.last_name}</p>
                    <p><strong>Email:</strong> {selectedApp.email}</p>
                    <p><strong>Phone:</strong> {selectedApp.phone}</p>
                    <p><strong>DOB:</strong> {selectedApp.date_of_birth}</p>
                    <p><strong>ID Number:</strong> {selectedApp.id_number}</p>
                  </div>
                  
                  <div className="col-md-6">
                    <h6>Address</h6>
                    <p>{selectedApp.address}</p>
                    <p>{selectedApp.city}, {selectedApp.state} {selectedApp.zip_code}</p>
                    
                    <h6 className="mt-3">Emergency Contact</h6>
                    <p><strong>Name:</strong> {selectedApp.emergency_name}</p>
                    <p><strong>Phone:</strong> {selectedApp.emergency_phone}</p>
                    <p><strong>Relationship:</strong> {selectedApp.emergency_relationship}</p>
                    
                    {selectedApp.membership_type === 'double' && (
                      <>
                        <h6 className="mt-3">Spouse Information</h6>
                        <p><strong>Name:</strong> {selectedApp.spouse_first_name} {selectedApp.spouse_last_name}</p>
                        <p><strong>DOB:</strong> {selectedApp.spouse_date_of_birth}</p>
                        <p><strong>ID:</strong> {selectedApp.spouse_id_number}</p>
                      </>
                    )}
                  </div>
                  
                  {selectedApp.children_info && (
                    <div className="col-12">
                      <h6>Children Information</h6>
                      {(() => {
                        try {
                          const children = typeof selectedApp.children_info === 'string' 
                            ? JSON.parse(selectedApp.children_info) 
                            : selectedApp.children_info;
                          
                          if (Array.isArray(children) && children.length > 0) {
                            return children.map((child, index) => (
                              <div key={index} className="border p-2 mb-2 rounded">
                                <p><strong>Name:</strong> {child.name}</p>
                                <p><strong>DOB:</strong> {child.date_of_birth}</p>
                                <p><strong>Relationship:</strong> {child.relationship}</p>
                              </div>
                            ));
                          }
                          return <p className="text-muted">No children information</p>;
                        } catch (error) {
                          console.error('Error parsing children_info:', error);
                          return <p className="text-muted">Error loading children information</p>;
                        }
                      })()} 
                    </div>
                  )}
                  
                  {selectedApp.admin_notes && (
                    <div className="col-12">
                      <h6>Admin Notes</h6>
                      <div className="alert alert-info">{selectedApp.admin_notes}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
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

export default MyApplications;