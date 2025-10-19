import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { beneficiariesAPI } from '../../services/api';

const MyBeneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      const response = await beneficiariesAPI.getBeneficiaries();
      setBeneficiaries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    current_names: '',
    new_names: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await beneficiariesAPI.createChangeRequest(formData);
      setShowForm(false);
      setFormData({
        full_name: '',
        email: '',
        current_names: '',
        new_names: '',
        address: '',
        city: '',
        state: '',
        zip: ''
      });
      alert('Beneficiary change request submitted successfully!');
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Error submitting request. Please try again.');
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">👥 My Beneficiaries</h4>
        <div>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => setShowForm(!showForm)}
          >
            <i className="bi bi-pencil-square me-1"></i>
            {showForm ? 'Cancel' : 'Request Change'}
          </button>
        </div>
      </div>
      <div className="card-body">
        {/* Current Beneficiaries */}
        <div className="mb-4">
          <h5 className="mb-3">Current Beneficiaries</h5>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : beneficiaries.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Phone Number</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiaries.map(beneficiary => (
                    <tr key={beneficiary.id}>
                      <td>{beneficiary.name}</td>
                      <td>{beneficiary.phone}</td>
                      <td>{beneficiary.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              No beneficiaries found. Please contact support to add beneficiaries.
            </div>
          )}
        </div>

        {/* Change Request Form */}
        {showForm && (
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Request Beneficiary Change</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Current Beneficiary Name(s) *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="current_names"
                      value={formData.current_names}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">New Beneficiary Name(s) *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="new_names"
                      value={formData.new_names}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Street Address</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">City</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">State</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Zip/Postal</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-check-circle me-1"></i>Submit Request
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBeneficiaries;