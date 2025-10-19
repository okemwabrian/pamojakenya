import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../../services/api';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await applicationAPI.getApplications();
      const applications = Array.isArray(response.data) ? response.data : [];
      setApplications(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this application? You can reapply after deletion.')) {
      try {
        await applicationAPI.deleteApplication(id);
        setApplications(prev => prev.filter(app => app.id !== id));
      } catch (error) {
        console.error('Error deleting application:', error);
      }
    }
  };

  const hasActiveApplication = applications.some(app => 
    ['pending', 'payment_submitted', 'approved'].includes(app.status)
  );
  
  const currentApplication = applications.find(app => 
    ['pending', 'payment_submitted', 'approved'].includes(app.status)
  );

  return (
    <div className="container-fluid">
      <div className="row g-4">
        {/* Current Application Status */}
        {currentApplication && (
          <div className="col-12">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-gradient bg-primary text-white">
                <h4 className="mb-0">
                  <i className="bi bi-file-text me-2"></i>
                  Current Application Status
                </h4>
              </div>
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-3">
                        <span className={`badge fs-6 ${
                          currentApplication.type === 'single' ? 'bg-primary' : 'bg-info'
                        }`}>
                          <i className={`bi ${currentApplication.type === 'single' ? 'bi-person' : 'bi-people'} me-1`}></i>
                          {currentApplication.type === 'single' ? 'Single Family' : 'Double Family'} Membership
                        </span>
                      </div>
                      <div>
                        <span className={`badge fs-6 ${
                          currentApplication.status === 'approved' ? 'bg-success' :
                          currentApplication.status === 'rejected' ? 'bg-danger' :
                          currentApplication.status === 'payment_submitted' ? 'bg-info' : 'bg-warning'
                        }`}>
                          {currentApplication.status === 'payment_submitted' ? 'Under Admin Review' :
                           currentApplication.status === 'pending' ? 'Payment Required' :
                           currentApplication.status.charAt(0).toUpperCase() + currentApplication.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <strong>Application ID:</strong> #{currentApplication.id}
                    </div>
                    <div className="mb-2">
                      <strong>Submitted:</strong> {new Date(currentApplication.created_at).toLocaleDateString()}
                    </div>
                    
                    {currentApplication.status === 'pending' && (
                      <div className="alert alert-warning mt-3">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        <strong>Action Required:</strong> Please submit your $50 activation fee to complete your application.
                      </div>
                    )}
                    
                    {currentApplication.status === 'payment_submitted' && (
                      <div className="alert alert-info mt-3">
                        <i className="bi bi-clock me-2"></i>
                        <strong>Under Review:</strong> Admin is verifying your payment. You'll be notified within 24-48 hours.
                      </div>
                    )}
                    
                    {currentApplication.status === 'approved' && (
                      <div className="alert alert-success mt-3">
                        <i className="bi bi-check-circle me-2"></i>
                        <strong>Congratulations!</strong> Your membership application has been approved. Welcome to Pamoja Kenya MN!
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-4 text-center">
                    {currentApplication.status === 'pending' && (
                      <Link to="/activation-fee" className="btn btn-success btn-lg mb-2 w-100">
                        <i className="bi bi-credit-card me-2"></i>
                        Pay Activation Fee
                      </Link>
                    )}
                    
                    {currentApplication.status === 'approved' && currentApplication.type === 'single' && (
                      <Link to="/upgrade" className="btn btn-info btn-lg mb-2 w-100">
                        <i className="bi bi-arrow-up-circle me-2"></i>
                        Upgrade to Double Family
                      </Link>
                    )}
                    
                    <button className="btn btn-outline-primary w-100">
                      <i className="bi bi-eye me-2"></i>
                      View Full Application
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application History */}
        <div className="col-12">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-gradient bg-secondary text-white">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Application History ({applications.length})
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status"></div>
                  <p className="mt-2">Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-file-text display-1 text-muted mb-3"></i>
                  <h5>No Applications Found</h5>
                  <p className="text-muted mb-4">You haven't submitted any membership applications yet.</p>
                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <Link to="/single-application" className="btn btn-primary btn-lg">
                      <i className="bi bi-person me-2"></i>Single Family Application
                    </Link>
                    <Link to="/double-application" className="btn btn-success btn-lg">
                      <i className="bi bi-people me-2"></i>Double Family Application
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Application Restriction Notice */}
                  {hasActiveApplication && (
                    <div className="alert alert-info mb-4">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Note:</strong> You can only have one active application at a time. Complete your current application before submitting a new one.
                    </div>
                  )}
                  
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th><i className="bi bi-hash me-1"></i>ID</th>
                          <th><i className="bi bi-person me-1"></i>Type</th>
                          <th><i className="bi bi-flag me-1"></i>Status</th>
                          <th><i className="bi bi-calendar me-1"></i>Submitted</th>
                          <th><i className="bi bi-gear me-1"></i>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map(app => (
                          <tr key={app.id} className={app.id === currentApplication?.id ? 'table-active' : ''}>
                            <td className="fw-bold">#{app.id}</td>
                            <td>
                              <span className={`badge ${
                                app.type === 'single' ? 'bg-primary' : 'bg-info'
                              }`}>
                                <i className={`bi ${app.type === 'single' ? 'bi-person' : 'bi-people'} me-1`}></i>
                                {app.type === 'single' ? 'Single Family' : 'Double Family'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                app.status === 'approved' ? 'bg-success' :
                                app.status === 'rejected' ? 'bg-danger' :
                                app.status === 'payment_submitted' ? 'bg-info' : 'bg-warning'
                              }`}>
                                {app.status === 'payment_submitted' ? 'Under Review' :
                                 app.status === 'pending' ? 'Payment Required' :
                                 app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </span>
                              {app.admin_notes && (
                                <small className="d-block text-muted mt-1">
                                  Admin: {app.admin_notes}
                                </small>
                              )}
                            </td>
                            <td>{new Date(app.created_at).toLocaleDateString()}</td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-primary" title="View Details">
                                  <i className="bi bi-eye"></i>
                                </button>
                                {app.status === 'pending' && (
                                  <>
                                    <Link 
                                      to="/activation-fee" 
                                      className="btn btn-outline-success"
                                      title="Pay Activation Fee"
                                    >
                                      <i className="bi bi-credit-card"></i>
                                    </Link>
                                    <button 
                                      className="btn btn-outline-danger"
                                      onClick={() => handleDelete(app.id)}
                                      title="Delete & Reapply"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </>
                                )}
                                {app.status === 'rejected' && (
                                  <button 
                                    className="btn btn-outline-danger"
                                    onClick={() => handleDelete(app.id)}
                                    title="Delete Application"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* New Application Button */}
                  {!hasActiveApplication && (
                    <div className="text-center mt-4">
                      <h6 className="mb-3">Ready to apply for membership?</h6>
                      <div className="d-flex justify-content-center gap-3 flex-wrap">
                        <Link to="/single-application" className="btn btn-primary">
                          <i className="bi bi-person me-2"></i>Single Family Application
                        </Link>
                        <Link to="/double-application" className="btn btn-success">
                          <i className="bi bi-people me-2"></i>Double Family Application
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;