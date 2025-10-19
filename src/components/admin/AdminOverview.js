import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminOverview = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    users: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalShares: 0,
    applications: 0,
    claims: 0,
    payments: 0,
    pendingApplications: 0,
    pendingClaims: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, appsRes, claimsRes, paymentsRes, statsRes] = await Promise.all([
        adminAPI.getUsers().catch(() => ({ data: [] })),
        adminAPI.getApplications().catch(() => ({ data: [] })),
        adminAPI.getClaims().catch(() => ({ data: [] })),
        adminAPI.getPayments().catch(() => ({ data: [] })),
        adminAPI.getStats().catch(() => ({ data: {} }))
      ]);

      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const applications = Array.isArray(appsRes.data) ? appsRes.data : [];
      const claims = Array.isArray(claimsRes.data) ? claimsRes.data : [];
      const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];
      const adminStats = statsRes.data || {};

      setStats({
        users: users.length,
        activeUsers: adminStats.active_users || 0,
        inactiveUsers: adminStats.inactive_users || 0,
        totalShares: adminStats.total_shares || 0,
        applications: applications.length,
        claims: claims.length,
        payments: payments.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        pendingClaims: claims.filter(claim => claim.status === 'pending').length,
        pendingPayments: payments.filter(payment => payment.status === 'pending').length
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPending = stats.pendingApplications + stats.pendingClaims + stats.pendingPayments;

  return (
    <div className="row g-4">
      <div className="col-sm-6 col-lg-3">
        <div className="card border-0 shadow-sm dashboard-card" style={{cursor: 'pointer'}} onClick={() => setActiveTab('users')}>
          <div className="card-body text-center p-4">
            <i className="bi bi-people-fill text-primary" style={{fontSize: '2rem'}}></i>
            <h2 className="fw-bold mb-1 text-primary">{loading ? '...' : stats.users}</h2>
            <p className="text-muted mb-0">Total Users</p>
            <small className="text-success">{stats.activeUsers} Active</small> | 
            <small className="text-danger">{stats.inactiveUsers} Inactive</small>
          </div>
        </div>
      </div>
      <div className="col-sm-6 col-lg-3">
        <div className="card border-0 shadow-sm dashboard-card" style={{cursor: 'pointer'}} onClick={() => setActiveTab('applications')}>
          <div className="card-body text-center p-4">
            <i className="bi bi-file-text-fill text-info" style={{fontSize: '2rem'}}></i>
            <h2 className="fw-bold mb-1 text-info">{loading ? '...' : stats.applications}</h2>
            <p className="text-muted mb-0">Applications</p>
            {stats.pendingApplications > 0 && (
              <small className="badge bg-warning">{stats.pendingApplications} pending</small>
            )}
          </div>
        </div>
      </div>
      <div className="col-sm-6 col-lg-3">
        <div className="card border-0 shadow-sm dashboard-card" style={{cursor: 'pointer'}} onClick={() => {
          alert(`Pending Items:\n- ${stats.pendingApplications} Applications\n- ${stats.pendingClaims} Claims\n- ${stats.pendingPayments} Payments`);
        }}>
          <div className="card-body text-center p-4">
            <i className="bi bi-clock-fill text-warning" style={{fontSize: '2rem'}}></i>
            <h2 className="fw-bold mb-1 text-warning">{loading ? '...' : totalPending}</h2>
            <p className="text-muted mb-0">Pending Items</p>
          </div>
        </div>
      </div>
      <div className="col-sm-6 col-lg-3">
        <div className="card border-0 shadow-sm dashboard-card" style={{cursor: 'pointer'}} onClick={() => setActiveTab('claims')}>
          <div className="card-body text-center p-4">
            <i className="bi bi-heart-pulse-fill text-success" style={{fontSize: '2rem'}}></i>
            <h2 className="fw-bold mb-1 text-success">{loading ? '...' : stats.claims}</h2>
            <p className="text-muted mb-0">Claims</p>
            {stats.pendingClaims > 0 && (
              <small className="badge bg-warning">{stats.pendingClaims} pending</small>
            )}
          </div>
        </div>
      </div>
      <div className="col-sm-6 col-lg-3">
        <div className="card border-0 shadow-sm dashboard-card">
          <div className="card-body text-center p-4">
            <i className="bi bi-graph-up text-warning" style={{fontSize: '2rem'}}></i>
            <h2 className="fw-bold mb-1 text-warning">{loading ? '...' : stats.totalShares}</h2>
            <p className="text-muted mb-0">Total Shares Owned</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;