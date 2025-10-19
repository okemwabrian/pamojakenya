import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useSnackbar } from '../hooks/useSnackbar';
import Snackbar from './Snackbar';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', username: '',
    phone: '', date_of_birth: '', national_id: '', gender: '', occupation: '',
    address: '', city: '', state: '', zip_code: '',
    emergency_name: '', emergency_phone: '', emergency_relationship: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        national_id: user.national_id || '',
        gender: user.gender || '',
        occupation: user.occupation || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zip_code: user.zip_code || '',
        emergency_name: user.emergency_name || '',
        emergency_phone: user.emergency_phone || '',
        emergency_relationship: user.emergency_relationship || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateUser(formData);
      updateUser(response.data);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      showError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card">
            <div className="card-header">
              <h3 className="mb-0">👤 My Profile</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">Personal Information</h5>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">First Name *</label>
                    <input type="text" className="form-control" name="first_name" 
                           value={formData.first_name} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name *</label>
                    <input type="text" className="form-control" name="last_name" 
                           value={formData.last_name} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">National ID</label>
                    <input type="text" className="form-control" name="national_id" 
                           value={formData.national_id} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" name="date_of_birth" 
                           value={formData.date_of_birth} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Gender</label>
                    <select className="form-select" name="gender" 
                            value={formData.gender} onChange={handleChange}>
                      <option value="">Select gender...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Occupation</label>
                    <input type="text" className="form-control" name="occupation" 
                           value={formData.occupation} onChange={handleChange} />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">Contact Information</h5>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Username *</label>
                    <input type="text" className="form-control" name="username" 
                           value={formData.username} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" name="email" 
                           value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-control" name="phone" 
                           value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <textarea className="form-control" name="address" rows="2"
                              value={formData.address} onChange={handleChange}></textarea>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">City</label>
                    <input type="text" className="form-control" name="city" 
                           value={formData.city} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">State</label>
                    <input type="text" className="form-control" name="state" 
                           value={formData.state} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">ZIP Code</label>
                    <input type="text" className="form-control" name="zip_code" 
                           value={formData.zip_code} onChange={handleChange} />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">Emergency Contact</h5>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" name="emergency_name" 
                           value={formData.emergency_name} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-control" name="emergency_phone" 
                           value={formData.emergency_phone} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Relationship</label>
                    <select className="form-select" name="emergency_relationship" 
                            value={formData.emergency_relationship} onChange={handleChange}>
                      <option value="">Select...</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="child">Child</option>
                      <option value="friend">Friend</option>
                    </select>
                  </div>
                </div>

                {/* Membership Info (Read-only) */}
                {user && (
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="border-bottom pb-2">Membership Information</h5>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Membership Type</label>
                      <input type="text" className="form-control" 
                             value={user.membership_type || 'Not Set'} readOnly />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Total Shares</label>
                      <input type="text" className="form-control" 
                             value={user.shares || 0} readOnly />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Status</label>
                      <input type="text" className="form-control" 
                             value={user.is_active_member ? 'Active' : 'Inactive'} readOnly />
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        isVisible={snackbar.show}
        onClose={hideSnackbar}
      />
    </div>
  );
};

export default Profile;