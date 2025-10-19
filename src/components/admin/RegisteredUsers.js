import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const RegisteredUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchRegisteredUsers();
  }, []);

  const fetchRegisteredUsers = async () => {
    try {
      const response = await adminAPI.getRegisteredUsers();
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching registered users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getDateFilteredUsers = (users) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'today':
        return users.filter(user => new Date(user.date_joined) >= today);
      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return users.filter(user => new Date(user.date_joined) >= weekStart);
      case 'last_week':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay());
        return users.filter(user => {
          const userDate = new Date(user.date_joined);
          return userDate >= lastWeekStart && userDate < lastWeekEnd;
        });
      case 'this_month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return users.filter(user => new Date(user.date_joined) >= monthStart);
      case 'last_month':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        return users.filter(user => {
          const userDate = new Date(user.date_joined);
          return userDate >= lastMonthStart && userDate < lastMonthEnd;
        });
      default:
        return users;
    }
  };

  const searchFilteredUsers = users.filter(user => 
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredUsers = getDateFilteredUsers(searchFilteredUsers);

  const totalShares = users.reduce((sum, user) => sum + (user.shares_owned || 0), 0);
  const activeUsers = users.filter(user => user.is_active).length;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>👥 Registered Users Overview</h3>
        <div className="d-flex gap-2">
          <select 
            className="form-select" 
            style={{width: '150px'}}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="last_week">Last Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
          </select>
          <input
            type="text"
            className="form-control"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{width: '300px'}}
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h4>{users.length}</h4>
              <p className="mb-0">Total Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h4>{activeUsers}</h4>
              <p className="mb-0">Active Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <h4>{users.length - activeUsers}</h4>
              <p className="mb-0">Inactive Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h4>{totalShares}</h4>
              <p className="mb-0">Total Shares</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">All Registered Users ({filteredUsers.length})</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Shares</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div>
                          <strong>{user.first_name} {user.last_name}</strong>
                          <small className="d-block text-muted">@{user.username}</small>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {user.shares_owned || 0}/{user.available_shares || 100}
                        </span>
                      </td>
                      <td>
                        {new Date(user.date_joined).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted">No users found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisteredUsers;