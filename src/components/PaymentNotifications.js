import React, { useState, useEffect } from 'react';
import { paymentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PaymentNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await paymentsAPI.getPayments();
      const userPayments = response.data.filter(payment => 
        payment.user_id === user.id && 
        ['approved', 'rejected'].includes(payment.status)
      );
      setNotifications(userPayments.slice(0, 5)); // Show last 5 notifications
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || notifications.length === 0) return null;

  return (
    <div className="card mb-4">
      <div className="card-header bg-info text-white">
        <h6 className="mb-0">🔔 Payment Notifications</h6>
      </div>
      <div className="card-body">
        {notifications.map(payment => (
          <div key={payment.id} className={`alert ${
            payment.status === 'approved' ? 'alert-success' : 'alert-danger'
          } mb-2`}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <strong>
                  {payment.status === 'approved' ? '✅' : '❌'} 
                  {payment.payment_type.replace('_', ' ').toUpperCase()}
                </strong>
                <div className="small">
                  Amount: ${payment.amount} | 
                  Date: {new Date(payment.updated_at).toLocaleDateString()}
                </div>
                {payment.admin_notes && (
                  <div className="small mt-1">
                    <strong>Admin Note:</strong> {payment.admin_notes}
                  </div>
                )}
              </div>
              <span className={`badge ${
                payment.status === 'approved' ? 'bg-success' : 'bg-danger'
              }`}>
                {payment.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentNotifications;