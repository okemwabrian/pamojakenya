import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zip_code: user?.zip_code || ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage('');

    try {
      const response = await userAPI.updateProfile(profileData);
      updateUser(response.data);
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage('New passwords do not match.');
      setIsUpdating(false);
      return;
    }

    try {
      await userAPI.changePassword({
        old_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      setMessage('Password changed successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage(error.response?.data?.error || 'Failed to change password. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="mb-0">⚙️ Profile Settings</h4>
      </div>
      <div className="card-body">
        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="bi bi-person me-1"></i>Personal Information
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <i className="bi bi-lock me-1"></i>Change Password
            </button>
          </li>
        </ul>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">First Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Last Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Email Address *</label>
              <input 
                type="email" 
                className="form-control" 
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className="form-control" 
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Address</label>
              <textarea 
                className="form-control" 
                name="address"
                value={profileData.address}
                onChange={handleProfileChange}
                rows="3"
              ></textarea>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="city"
                  value={profileData.city}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">State</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="state"
                  value={profileData.state}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Zip Code</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="zip_code"
                  value={profileData.zip_code}
                  onChange={handleProfileChange}
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={isUpdating}>
              <i className="bi bi-check-circle me-1"></i>
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-3">
              <label className="form-label">Current Password *</label>
              <input 
                type="password" 
                className="form-control" 
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">New Password * (minimum 6 characters)</label>
              <input 
                type="password" 
                className="form-control" 
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                minLength="6"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Confirm New Password *</label>
              <input 
                type="password" 
                className="form-control" 
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-warning" disabled={isUpdating}>
              <i className="bi bi-shield-lock me-1"></i>
              {isUpdating ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}

        {/* Message Display */}
        {message && (
          <div className={`alert mt-3 ${
            message.includes('successfully') ? 'alert-success' : 'alert-danger'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;