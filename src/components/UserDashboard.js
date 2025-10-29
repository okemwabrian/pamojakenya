import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentsAPI, claimsAPI, sharesAPI, documentsAPI, applicationAPI } from '../services/api';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    payments: [],
    claims: [],
    shares: [],
    documents: [],
    applications: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [paymentsRes, claimsRes, sharesRes, documentsRes, applicationsRes] = await Promise.all([
        paymentsAPI.getPayments().catch(() => ({ data: [] })),
        claimsAPI.getClaims().catch(() => ({ data: [] })),
        sharesAPI.getShares().catch(() => ({ data: [] })),
        documentsAPI.getDocuments().catch(() => ({ data: [] })),
        applicationAPI.getApplications().catch(() => ({ data: [] }))
      ]);

      setStats({
        payments: paymentsRes.data.payments || paymentsRes.data || [],
        claims: claimsRes.data.claims || claimsRes.data || [],
        shares: sharesRes.data.shares || sharesRes.data || [],
        documents: documentsRes.data.documents || documentsRes.data || [],
        applications: applicationsRes.data.applications || applicationsRes.data || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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

  const totalShares = user?.shares || 0;
  const totalPayments = Array.isArray(stats.payments) ? stats.payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) : 0;
  const pendingClaims = Array.isArray(stats.claims) ? stats.claims.filter(c => c.status === 'pending').length : 0;
  const membershipStatus = user?.is_active_member ? 'Active' : 'Inactive';

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status"></div>
          <p className="mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2>👋 Welcome, {user?.first_name || user?.username}!</h2>
          <p className="text-muted">Manage your membership and track your activities</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-xl-3 col-lg-6">
          <div className="stat-card primary">
            <div className="stat-icon">
              <i className="bi bi-person-check"></i>
            </div>
            <h3 className="stat-value">{membershipStatus}</h3>
            <p className="stat-label">Membership Status</p>
          </div>
        </div>
        
        <div className="col-xl-3 col-lg-6">
          <div className="stat-card success">
            <div className="stat-icon">
              <i className="bi bi-graph-up"></i>
            </div>
            <h3 className="stat-value">{totalShares}</h3>
            <p className="stat-label">Total Shares</p>
          </div>
        </div>
        
        <div className="col-xl-3 col-lg-6">
          <div className="stat-card warning">
            <div className="stat-icon">
              <i className="bi bi-currency-dollar"></i>
            </div>
            <h3 className="stat-value">${totalPayments.toFixed(2)}</h3>
            <p className="stat-label">Total Payments</p>
          </div>
        </div>
        
        <div className="col-xl-3 col-lg-6">
          <div className="stat-card danger">
            <div className="stat-icon">
              <i className="bi bi-file-earmark-text"></i>
            </div>
            <h3 className="stat-value">{pendingClaims}</h3>
            <p className="stat-label">Pending Claims</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">🚀 Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <Link to="/membership-application" className="btn btn-primary w-100">
                    <i className="bi bi-person-plus me-2"></i>
                    Apply for Membership
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link to="/payments" className="btn btn-success w-100">
                    <i className="bi bi-credit-card me-2"></i>
                    Make Payment
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link to="/claims" className="btn btn-warning w-100">
                    <i className="bi bi-file-earmark-plus me-2"></i>
                    Submit Claim
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link to="/shares" className="btn btn-info w-100">
                    <i className="bi bi-graph-up me-2"></i>
                    Buy Shares
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Applications */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📋 My Applications</h5>
              <Link to="/my-applications" className="btn btn-sm btn-primary">View All</Link>
            </div>
            <div className="card-body">
              {stats.applications.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted">No applications yet</p>
                  <Link to="/my-applications" className="btn btn-outline-primary btn-sm">
                    View Applications
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(stats.applications) && stats.applications.slice(0, 3).map(app => (
                        <tr key={app.id}>
                          <td>{app.membership_type}</td>
                          <td>
                            <span className={`badge ${getStatusBadge(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>{new Date(app.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">💳 My Payments</h5>
              <Link to="/payments" className="btn btn-sm btn-success">View All</Link>
            </div>
            <div className="card-body">
              {stats.payments.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted">No payments yet</p>
                  <Link to="/payments" className="btn btn-outline-success btn-sm">
                    Make Payment
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(stats.payments) && stats.payments.slice(0, 3).map(payment => (
                        <tr key={payment.id}>
                          <td>{payment.payment_type}</td>
                          <td>${payment.amount}</td>
                          <td>
                            <span className={`badge ${getStatusBadge(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Claims */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🎯 My Claims</h5>
              <Link to="/claims" className="btn btn-sm btn-warning">View All</Link>
            </div>
            <div className="card-body">
              {stats.claims.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted">No claims submitted</p>
                  <Link to="/claims" className="btn btn-outline-warning btn-sm">
                    Submit Claim
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(stats.claims) && stats.claims.slice(0, 3).map(claim => (
                        <tr key={claim.id}>
                          <td>{claim.claim_type}</td>
                          <td>${claim.amount_requested}</td>
                          <td>
                            <span className={`badge ${getStatusBadge(claim.status)}`}>
                              {claim.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My Shares */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📈 My Shares</h5>
              <Link to="/shares" className="btn btn-sm btn-info">Buy More</Link>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6">
                  <h4 className="text-primary">{totalShares}</h4>
                  <small className="text-muted">Total Shares</small>
                </div>
                <div className="col-6">
                  <h4 className="text-success">${(totalShares * 25).toFixed(2)}</h4>
                  <small className="text-muted">Share Value</small>
                </div>
              </div>
              {Array.isArray(stats.shares) && stats.shares.length > 0 && (
                <div className="mt-3">
                  <small className="text-muted">Recent Purchases:</small>
                  {stats.shares.slice(0, 2).map(share => (
                    <div key={share.id} className="d-flex justify-content-between mt-1">
                      <span>{share.number_of_shares} shares</span>
                      <span className={`badge ${getStatusBadge(share.status)}`}>
                        {share.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My Documents */}
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📄 My Documents</h5>
              <Link to="/documents" className="btn btn-sm btn-secondary">Manage</Link>
            </div>
            <div className="card-body">
              {stats.documents.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted">No documents uploaded</p>
                  <Link to="/documents" className="btn btn-outline-secondary btn-sm">
                    Upload Documents
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Document</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Upload Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(stats.documents) && stats.documents.slice(0, 5).map(doc => (
                        <tr key={doc.id}>
                          <td>{doc.title}</td>
                          <td>{doc.document_type}</td>
                          <td>
                            <span className={`badge ${getStatusBadge(doc.status)}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;