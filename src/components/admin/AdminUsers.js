import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import * as XLSX from 'xlsx';
import AdminTest from './AdminTest';
import AdminUserEdit from './AdminUserEdit';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    console.log('Token in localStorage:', localStorage.getItem('token'));
    console.log('API base URL:', process.env.REACT_APP_API_URL || 'http://localhost:8000/api');
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await adminAPI.getUsers();
      console.log('Users response:', response);
      console.log('Response data:', response.data);
      
      // Handle paginated response
      let users = [];
      if (response.data?.results) {
        users = response.data.results;
      } else if (Array.isArray(response.data)) {
        users = response.data;
      }
      
      console.log('Processed users:', users);
      setUsers(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      console.error('Error details:', err.response?.data);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, data = null) => {
    try {
      switch (action) {
        case 'activate':
          await adminAPI.activateUser(userId);
          alert('User activated successfully');
          break;
        case 'deactivate':
          await adminAPI.deactivateUser(userId, data);
          alert('User deactivated successfully');
          break;
        case 'update_shares':
          await adminAPI.updateShares(userId, data);
          alert(`Shares updated to ${data}`);
          break;
        case 'toggle_admin':
          await adminAPI.updateUser(userId, { is_staff: !users.find(u => u.id === userId).is_staff });
          break;
        case 'reset_password':
          await adminAPI.resetPassword(userId);
          alert('New password sent to user email');
          break;
        case 'delete':
          await adminAPI.deleteUser(userId);
          break;
        default:
          break;
      }
      fetchUsers(); // Refresh users list
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Error updating user. Please try again.');
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
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredUsers = getDateFilteredUsers(searchFilteredUsers);

  const exportToExcel = () => {
    const exportData = filteredUsers.map(user => ({
      'First Name': user.first_name,
      'Last Name': user.last_name,
      'Email': user.email,
      'Status': user.is_active ? 'Active' : 'Inactive',
      'Role': user.is_staff ? 'Admin' : 'Member',
      'Join Date': new Date(user.date_joined).toLocaleDateString()
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, `Users_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const printUsers = () => {
    const printContent = `
      <html>
        <head>
          <title>Users Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Pamoja Kenya MN - Users Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <p><strong>Total Users: ${filteredUsers.length}</strong></p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Role</th>
                <th>Join Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsers.map(user => `
                <tr>
                  <td>${user.first_name} ${user.last_name}</td>
                  <td>${user.email}</td>
                  <td>${user.is_active ? 'Active' : 'Inactive'}</td>
                  <td>${user.is_staff ? 'Admin' : 'Member'}</td>
                  <td>${new Date(user.date_joined).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>👥 User Management</h3>
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
          <button 
            className="btn btn-warning btn-sm" 
            onClick={() => {
              console.log('Manual test - Token:', localStorage.getItem('token'));
              fetchUsers();
            }}
          >
            🔄 Refresh
          </button>
          <button className="btn btn-outline-success" onClick={exportToExcel}>
            <i className="bi bi-file-earmark-excel"></i> Export Excel
          </button>
          <button className="btn btn-outline-primary" onClick={printUsers}>
            <i className="bi bi-printer"></i> Print
          </button>
          <input
            type="text"
            className="form-control"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{width: '200px'}}
          />
        </div>
      </div>

      <AdminTest />
      
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.first_name} {user.last_name}</strong>
                    <small className="d-block text-muted">{user.email}</small>
                    {user.deactivation_reason && (
                      <small className="d-block text-danger">Reason: {user.deactivation_reason}</small>
                    )}
                    <small className="d-block text-info">Shares: {user.shares_owned || 0}/{user.available_shares || 100}</small>
                  </td>
                  <td>
                    <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.is_staff ? 'bg-primary' : 'bg-secondary'}`}>
                      {user.is_staff ? 'Admin' : 'Member'}
                    </span>
                  </td>
                  <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-outline-primary" 
                        title="Edit User"
                        onClick={() => setEditingUser(user.id)}
                      >
                        <i className="bi bi-pencil me-1"></i>Edit
                      </button>
                      <button 
                        className="btn btn-outline-warning"
                        onClick={() => {
                          if (user.is_active) {
                            const reason = prompt(`Deactivation reason for ${user.first_name} ${user.last_name}:`);
                            if (reason && reason.trim()) {
                              handleUserAction(user.id, 'deactivate', reason);
                            }
                          } else {
                            if (window.confirm(`Activate user ${user.first_name} ${user.last_name}?`)) {
                              handleUserAction(user.id, 'activate');
                            }
                          }
                        }}
                        title={user.is_active ? 'Deactivate User' : 'Activate User'}
                      >
                        <i className={`bi ${user.is_active ? 'bi-pause' : 'bi-play'} me-1`}></i>
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        className="btn btn-outline-info"
                        onClick={() => {
                          const sharesOwned = prompt(`Shares owned by ${user.first_name} ${user.last_name}:`, user.shares_owned || 0);
                          const availableShares = prompt(`Available shares for ${user.first_name} ${user.last_name}:`, user.available_shares || 100);
                          
                          if (sharesOwned !== null && availableShares !== null && !isNaN(sharesOwned) && !isNaN(availableShares)) {
                            handleUserAction(user.id, 'update_shares', {
                              shares_owned: parseInt(sharesOwned),
                              available_shares: parseInt(availableShares)
                            });
                          }
                        }}
                        title="Update Shares"
                      >
                        <i className="bi bi-piggy-bank me-1"></i>Shares ({user.shares_owned || 0}/{user.available_shares || 100})
                      </button>
                      <button 
                        className="btn btn-outline-info"
                        onClick={() => {
                          if (window.confirm(`🛡️ ${user.is_staff ? 'Remove admin rights from' : 'Grant admin rights to'} ${user.first_name} ${user.last_name}?`)) {
                            handleUserAction(user.id, 'toggle_admin');
                            alert(`🛡️ ${user.is_staff ? 'Admin rights REMOVED from' : 'Admin rights GRANTED to'} ${user.first_name} ${user.last_name}`);
                          }
                        }}
                        title={user.is_staff ? 'Remove Admin' : 'Make Admin'}
                      >
                        <i className="bi bi-shield me-1"></i>
                        {user.is_staff ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          if (window.confirm(`🔑 Reset password for ${user.first_name} ${user.last_name}?`)) {
                            handleUserAction(user.id, 'reset_password');
                            alert(`🔑 SUCCESS: Password reset email sent to ${user.first_name} ${user.last_name} (${user.email})`);
                          }
                        }}
                        title="Reset Password"
                      >
                        <i className="bi bi-key me-1"></i>Reset Password
                      </button>
                      <button 
                        className="btn btn-outline-danger"
                        onClick={() => {
                          if(window.confirm(`🗑️ PERMANENTLY DELETE user ${user.first_name} ${user.last_name}?\nThis action cannot be undone!`)) {
                            handleUserAction(user.id, 'delete');
                            alert(`🗑️ User DELETED: ${user.first_name} ${user.last_name}`);
                          }
                        }}
                        title="Delete User"
                      >
                        <i className="bi bi-trash me-1"></i>Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {editingUser && (
        <AdminUserEdit
          userId={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
};

export default AdminUsers;