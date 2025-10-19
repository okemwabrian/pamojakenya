import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminShares = () => {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    try {
      const response = await adminAPI.getShares();
      const sharesData = Array.isArray(response.data) ? response.data : [];
      setShares(sharesData);
    } catch (err) {
      console.error('Error fetching shares:', err);
      setShares([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, buyerName) => {
    if (window.confirm(`✅ Approve share purchase for ${buyerName}?`)) {
      try {
        await adminAPI.approveSharePurchase(id, { approved: true });
        setShares(prev => prev.map(share => 
          share.id === id ? { ...share, status: 'approved' } : share
        ));
        alert(`✅ Share purchase approved for ${buyerName}!`);
      } catch (err) {
        alert('❌ Error approving share purchase');
      }
    }
  };

  const handleReject = async (id, buyerName) => {
    const reason = prompt(`❌ Rejection reason for ${buyerName}'s share purchase:`);
    if (reason && reason.trim()) {
      try {
        await adminAPI.rejectSharePurchase(id, { reason });
        setShares(prev => prev.map(share => 
          share.id === id ? { ...share, status: 'rejected', rejection_reason: reason } : share
        ));
        alert(`❌ Share purchase rejected for ${buyerName}`);
      } catch (err) {
        alert('❌ Error rejecting share purchase');
      }
    }
  };

  const filteredShares = Array.isArray(shares) ? shares.filter(share => 
    filter === 'all' ? true : share.status === filter
  ) : [];

  const getStatusCount = (status) => 
    Array.isArray(shares) ? shares.filter(share => share.status === status).length : 0;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">🏦 Share Purchase Management</h3>
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
            All Purchases ({shares.length})
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
                <th>Buyer Details</th>
                <th>Share Info</th>
                <th>Payment Proof</th>
                <th>Status</th>
                <th>Purchase Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShares.map(share => (
                <tr key={share.id}>
                  <td>
                    <strong>{share.buyer_name || share.user_name}</strong>
                    <small className="d-block text-muted">{share.user_email}</small>
                    <small className="d-block text-muted">ID: {share.user_id}</small>
                  </td>
                  <td>
                    <div><strong>{share.quantity} shares</strong></div>
                    <small className="text-muted">
                      ${share.amount_per_share} per share
                    </small>
                    <div className="fw-bold text-success">
                      Total: ${share.total_amount}
                    </div>
                  </td>
                  <td>
                    {share.payment_proof ? (
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => window.open(share.payment_proof_url, '_blank')}
                      >
                        <i className="bi bi-file-image me-1"></i>View Proof
                      </button>
                    ) : (
                      <span className="text-muted">No proof uploaded</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      share.status === 'approved' ? 'bg-success' :
                      share.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                    }`}>
                      {share.status === 'pending' ? 'Pending Review' :
                       share.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                    {share.rejection_reason && (
                      <small className="d-block text-danger mt-1">
                        Reason: {share.rejection_reason}
                      </small>
                    )}
                  </td>
                  <td>
                    {new Date(share.created_at).toLocaleDateString()}
                    <small className="d-block text-muted">
                      {new Date(share.created_at).toLocaleTimeString()}
                    </small>
                  </td>
                  <td>
                    {share.status === 'pending' && (
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-success"
                          onClick={() => handleApprove(share.id, share.buyer_name || share.user_name)}
                        >
                          <i className="bi bi-check me-1"></i>Approve
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => handleReject(share.id, share.buyer_name || share.user_name)}
                        >
                          <i className="bi bi-x me-1"></i>Reject
                        </button>
                      </div>
                    )}
                    {share.status !== 'pending' && (
                      <span className="badge bg-secondary">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredShares.length === 0 && !loading && (
        <div className="text-center py-5">
          <i className="bi bi-piggy-bank display-1 text-muted"></i>
          <h4 className="text-muted mt-3">No Share Purchases</h4>
          <p className="text-muted">No share purchases found for the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default AdminShares;