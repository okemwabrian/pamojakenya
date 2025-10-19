import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ErrorMessage from '../ErrorMessage';
import SuccessMessage from '../SuccessMessage';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deductionData, setDeductionData] = useState({ amount: '', reason: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users/registered_users/');
      setUsers(response.data);
    } catch (error) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const getSharesColor = (shares, isActive) => {
    if (!isActive) return 'text-secondary';
    if (shares < 25) return 'text-danger';
    return 'text-success';
  };

  const activateUser = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/activate_user/`);
      setSuccess('User activated successfully');
      fetchUsers();
    } catch (error) {
      setError('Failed to activate user');
    }
  };

  const deactivateUser = async (userId, reason) => {
    try {
      await api.post(`/admin/users/${userId}/deactivate_user/`, { reason });
      setSuccess('User deactivated successfully');
      fetchUsers();
    } catch (error) {
      setError('Failed to deactivate user');
    }
  };

  const updateShares = async (userId, sharesOwned, availableShares) => {
    try {
      await api.post(`/admin/users/${userId}/update_shares/`, {
        shares_owned: sharesOwned,
        available_shares: availableShares
      });
      setSuccess('Shares updated successfully');
      fetchUsers();
    } catch (error) {
      setError('Failed to update shares');
    }
  };

  const deductSharesFromAll = async () => {
    if (!deductionData.amount || !deductionData.reason) {
      setError('Please provide both amount and reason for deduction');
      return;
    }

    try {
      const response = await api.post('/admin/contact/deduct_shares_all/', deductionData);
      setSuccess(`Shares deducted from ${response.data.users_affected} users. ${response.data.users_deactivated} users were deactivated.`);
      setDeductionData({ amount: '', reason: '' });
      fetchUsers();
    } catch (error) {
      setError('Failed to deduct shares');
    }
  };

  if (loading) return <div className="text-center">Loading users...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>User Management</h4>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />

      {/* Bulk Share Deduction */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Bulk Share Deduction</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                placeholder="Amount to deduct"
                value={deductionData.amount}
                onChange={(e) => setDeductionData({...deductionData, amount: e.target.value})}
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Reason for deduction"
                value={deductionData.reason}
                onChange={(e) => setDeductionData({...deductionData, reason: e.target.value})}
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-warning" onClick={deductSharesFromAll}>
                Deduct All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Shares</th>
                  <th>Available</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className={getSharesColor(user.shares_owned, user.is_active)}>
                      {user.shares_owned}
                    </td>
                    <td>{user.available_shares}</td>
                    <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        {user.is_active ? (
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => {
                              const reason = prompt('Reason for deactivation:');
                              if (reason) deactivateUser(user.id, reason);
                            }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button 
                            className="btn btn-outline-success"
                            onClick={() => activateUser(user.id)}
                          >
                            Activate
                          </button>
                        )}
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => {
                            const shares = prompt('New shares owned:', user.shares_owned);
                            const available = prompt('Available shares:', user.available_shares);
                            if (shares !== null && available !== null) {
                              updateShares(user.id, shares, available);
                            }
                          }}
                        >
                          Update Shares
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;