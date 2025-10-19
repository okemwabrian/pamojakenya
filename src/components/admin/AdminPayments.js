import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [paymentTypes, setPaymentTypes] = useState([]);

  useEffect(() => {
    fetchPayments();
    fetchPaymentTypes();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await adminAPI.getPayments();
      setPayments(response.data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentTypes = async () => {
    try {
      const response = await adminAPI.getPaymentTypes();
      setPaymentTypes(response.data || []);
    } catch (err) {
      console.error('Error fetching payment types:', err);
    }
  };

  const handleApprovePayment = async (id, userName) => {
    const notes = prompt(`✅ Approval notes for ${userName}'s payment (optional):`);
    if (notes !== null) {
      try {
        await adminAPI.approvePayment(id, { notes });
        setPayments(prev => prev.map(payment => 
          payment.id === id ? { ...payment, status: 'completed' } : payment
        ));
        alert(`✅ Payment approved for ${userName}!`);
      } catch (err) {
        alert('❌ Error approving payment');
      }
    }
  };

  const handleRejectPayment = async (id, userName) => {
    const reason = prompt(`❌ Rejection reason for ${userName}'s payment:`);
    if (reason && reason.trim()) {
      try {
        await adminAPI.rejectPayment(id, { reason });
        setPayments(prev => prev.map(payment => 
          payment.id === id ? { ...payment, status: 'failed' } : payment
        ));
        alert(`❌ Payment rejected for ${userName}`);
      } catch (err) {
        alert('❌ Error rejecting payment');
      }
    }
  };

  const getPaymentTypeLabel = (type) => {
    const paymentType = paymentTypes.find(pt => pt.value === type);
    return paymentType ? paymentType.label : type;
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    if (filter === 'activation_fee') return payment.payment_type === 'activation_fee';
    if (filter === 'membership') return payment.payment_type?.includes('membership');
    if (filter === 'processing') return payment.status === 'processing';
    return payment.status === filter;
  });

  const getFilterCount = (filterType) => {
    if (filterType === 'activation_fee') {
      return payments.filter(p => p.payment_type === 'activation_fee').length;
    }
    if (filterType === 'membership') {
      return payments.filter(p => p.payment_type?.includes('membership')).length;
    }
    return payments.filter(p => p.status === filterType).length;
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">💳 Payment Management</h3>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={() => window.open('/api/admin/payments/financial_report/', '_blank')}
          >
            <i className="bi bi-file-earmark-text me-1"></i>Financial Report
          </button>
          <button 
            className="btn btn-outline-success btn-sm"
            onClick={() => window.open('/api/admin/payments/shares_report/', '_blank')}
          >
            <i className="bi bi-piggy-bank me-1"></i>Shares Report
          </button>
        </div>
      </div>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({getFilterCount('pending')})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'activation_fee' ? 'active' : ''}`}
            onClick={() => setFilter('activation_fee')}
          >
            Activation Fees ({getFilterCount('activation_fee')})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'membership' ? 'active' : ''}`}
            onClick={() => setFilter('membership')}
          >
            Membership Fees ({getFilterCount('membership')})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'processing' ? 'active' : ''}`}
            onClick={() => setFilter('processing')}
          >
            Processing ({getFilterCount('processing')})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({getFilterCount('completed')})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Payments ({payments.length})
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
                <th>User Details</th>
                <th>Payment Info</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Proof</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id}>
                  <td>
                    <strong>{payment.user_name}</strong>
                    <small className="d-block text-muted">{payment.user_email}</small>
                  </td>
                  <td>
                    <div><strong>{payment.description || 'Payment'}</strong></div>
                    {payment.reference_number && (
                      <small className="d-block text-muted">Ref: {payment.reference_number}</small>
                    )}
                    {payment.payment_method && (
                      <small className="d-block text-info">Method: {payment.payment_method}</small>
                    )}
                    {payment.transaction_id && (
                      <small className="d-block text-muted">TX: {payment.transaction_id}</small>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      payment.payment_type === 'activation_fee' ? 'bg-warning' :
                      payment.payment_type?.includes('membership') ? 'bg-info' :
                      'bg-secondary'
                    }`}>
                      {getPaymentTypeLabel(payment.payment_type)}
                    </span>
                  </td>
                  <td>
                    <strong className="text-success">${payment.amount}</strong>
                  </td>
                  <td>
                    {payment.payment_proof_url ? (
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => window.open(payment.payment_proof_url, '_blank')}
                      >
                        <i className="bi bi-file-image me-1"></i>View Proof
                      </button>
                    ) : (
                      <span className="text-muted">No proof</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      payment.status === 'completed' ? 'bg-success' :
                      payment.status === 'failed' ? 'bg-danger' : 'bg-warning'
                    }`}>
                      {payment.status === 'pending' ? 'Pending' :
                       payment.status === 'completed' ? 'Completed' : 'Failed'}
                    </span>
                  </td>
                  <td>
                    {new Date(payment.created_at).toLocaleDateString()}
                    <small className="d-block text-muted">
                      {new Date(payment.created_at).toLocaleTimeString()}
                    </small>
                  </td>
                  <td>
                    {payment.status === 'pending' && (
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-success"
                          onClick={() => handleApprovePayment(payment.id, payment.user_name)}
                        >
                          <i className="bi bi-check me-1"></i>Approve
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => handleRejectPayment(payment.id, payment.user_name)}
                        >
                          <i className="bi bi-x me-1"></i>Reject
                        </button>
                      </div>
                    )}
                    {payment.status === 'completed' && (
                      <span className="badge bg-success">Approved</span>
                    )}
                    {payment.status === 'failed' && (
                      <span className="badge bg-danger">Rejected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredPayments.length === 0 && !loading && (
        <div className="text-center py-5">
          <i className="bi bi-credit-card display-1 text-muted"></i>
          <h4 className="text-muted mt-3">No Payments</h4>
          <p className="text-muted">No payments found for the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;