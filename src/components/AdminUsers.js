import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (userId, userName) => {
    if (window.confirm(`✅ Activate user: ${userName}?\n\nThis will:\n- Enable full account access\n- Send activation email to user\n- Notify admin at pamojakeny@gmail.com`)) {
      try {
        await adminAPI.activateUser(userId);
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, is_activated: true } : user
        ));
        alert(`✅ SUCCESS: User ${userName} activated!\n\n📧 Notifications sent to:\n- User email\n- Admin (pamojakeny@gmail.com)`);
      } catch (err) {
        console.error('Activation error:', err);
        alert('❌ ERROR: Failed to activate user. Please check the backend logs.');
      }
    }
  };

  const handleDeactivateUser = async (userId, userName) => {
    const reason = prompt(`❌ Deactivation reason for ${userName}:`);
    if (reason && reason.trim()) {
      try {
        await adminAPI.deactivateUser(userId, reason);
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, is_activated: false } : user
        ));
        alert(`❌ User ${userName} deactivated!`);
      } catch (err) {
        alert('❌ ERROR: Failed to deactivate user');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'activated') return user.is_activated;
    if (filter === 'pending') return !user.is_activated;
    return true;
  });

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">👥 User Management</h3>
      </div>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending Activation ({users.filter(u => !u.is_activated).length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'activated' ? 'active' : ''}`}
            onClick={() => setFilter('activated')}
          >
            Activated ({users.filter(u => u.is_activated).length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Users ({users.length})
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
                <th>Contact Info</th>
                <th>Registration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.full_name || `${user.first_name} ${user.last_name}`}</strong>
                    <small className="d-block text-muted">@{user.username}</small>
                  </td>
                  <td>
                    <div>{user.email}</div>
                    {user.phone_number && <small className="text-muted">{user.phone_number}</small>}
                  </td>
                  <td>
                    <div>{new Date(user.registration_date).toLocaleDateString()}</div>
                    {user.last_login && (
                      <small className="text-muted">
                        Last: {new Date(user.last_login).toLocaleDateString()}
                      </small>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${user.is_activated ? 'bg-success' : 'bg-warning'}`}>
                      {user.is_activated ? 'Activated' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      {!user.is_activated ? (
                        <button 
                          className="btn btn-outline-success"
                          onClick={() => handleActivateUser(user.id, user.username)}
                        >
                          <i className="bi bi-check-circle me-1"></i>Activate
                        </button>
                      ) : (
                        <button 
                          className="btn btn-outline-warning"
                          onClick={() => handleDeactivateUser(user.id, user.username)}
                        >
                          <i className="bi bi-x-circle me-1"></i>Deactivate
                        </button>
                      )}
                      <button 
                        className="btn btn-outline-info"
                        onClick={() => alert(`👤 User Details:\n\nName: ${user.full_name || `${user.first_name} ${user.last_name}`}\nEmail: ${user.email}\nPhone: ${user.phone_number || 'Not provided'}\nRegistered: ${new Date(user.registration_date).toLocaleDateString()}\nStatus: ${user.is_activated ? 'Active' : 'Inactive'}`)}
                      >
                        <i className="bi bi-info-circle me-1"></i>Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;