import React, { useState, useEffect } from 'react';
import { applicationAPI, paymentsAPI, sharesAPI, claimsAPI, documentsAPI } from '../../services/api';

const UserActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAllActivities();
  }, []);

  const fetchAllActivities = async () => {
    try {
      const [applications, payments, shares, claims, documents] = await Promise.all([
        applicationAPI.getApplications().catch(() => ({ data: [] })),
        paymentsAPI.getPayments().catch(() => ({ data: [] })),
        sharesAPI.getShares().catch(() => ({ data: [] })),
        claimsAPI.getClaims().catch(() => ({ data: [] })),
        documentsAPI.getDocuments().catch(() => ({ data: [] }))
      ]);

      const allActivities = [
        ...(Array.isArray(applications.data) ? applications.data : []).map(item => ({
          ...item,
          type: 'application',
          title: `${item.membership_type || item.type || 'Membership'} Application`,
          date: item.created_at,
          status: item.status,
          amount: null
        })),
        ...(Array.isArray(payments.data) ? payments.data : []).map(item => ({
          ...item,
          type: 'payment',
          title: `Payment - ${item.payment_method || 'Unknown'}`,
          date: item.created_at,
          status: item.status,
          amount: item.amount
        })),
        ...(Array.isArray(shares.data) ? shares.data : []).map(item => ({
          ...item,
          type: 'shares',
          title: `Share Purchase`,
          date: item.created_at,
          status: 'completed',
          amount: item.amount_paid || item.amount
        })),
        ...(Array.isArray(claims.data) ? claims.data : []).map(item => ({
          ...item,
          type: 'claim',
          title: `${item.claim_type || 'Benefit'} Claim`,
          date: item.created_at,
          status: item.status,
          amount: item.amount_requested
        })),
        ...(Array.isArray(documents.data) ? documents.data : []).map(item => ({
          ...item,
          type: 'document',
          title: `Document: ${item.name}`,
          date: item.created_at,
          status: item.status,
          amount: null
        }))
      ];

      // Sort by date (newest first)
      allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivities(allActivities);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => 
    filter === 'all' ? true : activity.type === filter
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case 'application': return 'bi-file-text';
      case 'payment': return 'bi-credit-card';
      case 'shares': return 'bi-piggy-bank';
      case 'claim': return 'bi-heart-pulse';
      case 'document': return 'bi-file-earmark';
      default: return 'bi-circle';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'rejected': return 'bg-danger';
      case 'pending': return 'bg-warning';
      case 'completed': return 'bg-success';
      case 'failed': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>📊 My Activity History</h3>
        <div className="btn-group">
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('all')}
          >
            All ({activities.length})
          </button>
          <button 
            className={`btn ${filter === 'application' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('application')}
          >
            Applications ({activities.filter(a => a.type === 'application').length})
          </button>
          <button 
            className={`btn ${filter === 'payment' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('payment')}
          >
            Payments ({activities.filter(a => a.type === 'payment').length})
          </button>
          <button 
            className={`btn ${filter === 'shares' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('shares')}
          >
            Shares ({activities.filter(a => a.type === 'shares').length})
          </button>
          <button 
            className={`btn ${filter === 'claim' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('claim')}
          >
            Claims ({activities.filter(a => a.type === 'claim').length})
          </button>
          <button 
            className={`btn ${filter === 'document' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('document')}
          >
            Documents ({activities.filter(a => a.type === 'document').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No activities found for this filter.</p>
              </div>
            ) : (
              <div className="timeline">
                {filteredActivities.map((activity, index) => (
                  <div key={`${activity.type}-${activity.id}`} className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-center">
                          <i className={`bi ${getTypeIcon(activity.type)} text-primary me-3`} style={{fontSize: '1.5rem'}}></i>
                          <div>
                            <h6 className="mb-1">{activity.title}</h6>
                            <small className="text-muted">
                              {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString()}
                            </small>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className={`badge ${getStatusBadge(activity.status)}`}>
                            {activity.status}
                          </span>
                          {activity.amount && (
                            <div className="mt-1">
                              <small className="text-success fw-bold">${activity.amount}</small>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Additional Details */}
                      {activity.type === 'application' && (
                        <div className="mt-2">
                          <small className="text-muted">
                            Membership Type: {activity.membership_type}
                            {activity.admin_notes && (
                              <div className="mt-1">
                                <strong>Admin Notes:</strong> {activity.admin_notes}
                              </div>
                            )}
                          </small>
                        </div>
                      )}
                      
                      {activity.type === 'payment' && (
                        <div className="mt-2">
                          <small className="text-muted">
                            Method: {activity.payment_method} | Transaction ID: {activity.transaction_id}
                          </small>
                        </div>
                      )}
                      
                      {activity.type === 'shares' && (
                        <div className="mt-2">
                          <small className="text-muted">
                            Shares Purchased: {activity.shares_purchased} | Amount: ${activity.amount_paid}
                          </small>
                        </div>
                      )}
                      
                      {activity.type === 'claim' && (
                        <div className="mt-2">
                          <small className="text-muted">
                            Claim Type: {activity.claim_type} | Requested: ${activity.amount_requested}
                            {activity.amount_approved && (
                              <span> | Approved: ${activity.amount_approved}</span>
                            )}
                            {activity.admin_notes && (
                              <div className="mt-1">
                                <strong>Admin Notes:</strong> {activity.admin_notes}
                              </div>
                            )}
                          </small>
                        </div>
                      )}
                      
                      {activity.type === 'document' && (
                        <div className="mt-2">
                          <small className="text-muted">
                            Type: {activity.document_type} | Size: {activity.file_size}
                            {activity.admin_notes && (
                              <div className="mt-1">
                                <strong>Admin Notes:</strong> {activity.admin_notes}
                              </div>
                            )}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivity;