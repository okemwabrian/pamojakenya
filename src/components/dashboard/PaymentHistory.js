import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentsAPI } from '../../services/api';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentsAPI.getPayments();
      const payments = Array.isArray(response.data) ? response.data : [];
      setPayments(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">💳 Payment History</h4>
        <div>
          <Link to="/payments" className="btn btn-primary btn-sm">Make New Payment</Link>
        </div>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-credit-card display-1 text-muted"></i>
            <h5 className="mt-3">No Payment History</h5>
            <p className="text-muted">You haven't made any payments yet.</p>
            <Link to="/payments" className="btn btn-primary">Make Your First Payment</Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                    <td className="fw-bold text-success">${payment.amount}</td>
                    <td>
                      <span className={`badge ${
                        payment.payment_method === 'paypal' ? 'bg-primary' :
                        payment.payment_method === 'bank' ? 'bg-info' : 'bg-success'
                      }`}>
                        {payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1)}
                      </span>
                    </td>
                    <td><small className="text-muted">{payment.transaction_id}</small></td>
                    <td>
                      <span className={`badge ${
                        payment.status === 'completed' ? 'bg-success' :
                        payment.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
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
  );
};

export default PaymentHistory;