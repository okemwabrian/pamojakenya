import React, { useState } from 'react';
import { applicationAPI } from '../services/api';

const DoubleApplication = () => {
  const [formData, setFormData] = useState({
    first_name: '', middle_name: '', last_name: '', email: '', confirm_email: '', phone: '',
    address_1: '', address_2: '', city: '', state_province: '', zip_postal: '',
    spouse_name: '', spouse_phone: '', authorized_rep: '',
    child_1: '', child_2: '', child_3: '', child_4: '', child_5: '',
    parent_1: '', parent_2: '', spouse_parent_1: '', spouse_parent_2: '',
    sibling_1: '', sibling_2: '', sibling_3: '', constitution_agreed: false
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please upload identification document');
      return;
    }
    if (formData.email !== formData.confirm_email) {
      setMessage('Email addresses do not match');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      submitData.append('id_document', file);

      await applicationAPI.submitDouble(submitData);
      setMessage('Double family application submitted successfully!');
      
      // Reset form
      setFormData({
        first_name: '', middle_name: '', last_name: '', email: '', confirm_email: '', phone: '',
        address_1: '', address_2: '', city: '', state_province: '', zip_postal: '',
        spouse_name: '', spouse_phone: '', authorized_rep: '',
        child_1: '', child_2: '', child_3: '', child_4: '', child_5: '',
        parent_1: '', parent_2: '', spouse_parent_1: '', spouse_parent_2: '',
        sibling_1: '', sibling_2: '', sibling_3: '', constitution_agreed: false
      });
      setFile(null);
    } catch (err) {
      setMessage('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Double Family Membership Application</h2>
      
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      <div className="application-form">
        <form onSubmit={handleSubmit} className="row g-3">
        {/* Personal Information */}
        <div className="col-12"><h4>Personal Information</h4></div>
        <div className="col-md-4">
          <label className="form-label">First Name *</label>
          <input type="text" className="form-control" name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div className="col-md-4">
          <label className="form-label">Middle Name</label>
          <input type="text" className="form-control" name="middle_name" value={formData.middle_name} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Last Name *</label>
          <input type="text" className="form-control" name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Email *</label>
          <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Confirm Email *</label>
          <input type="email" className="form-control" name="confirm_email" value={formData.confirm_email} onChange={handleChange} required />
        </div>
        <div className="col-12">
          <label className="form-label">Phone *</label>
          <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required />
        </div>

        {/* Address */}
        <div className="col-12"><h4>Address Information</h4></div>
        <div className="col-12">
          <label className="form-label">Address Line 1 *</label>
          <input type="text" className="form-control" name="address_1" value={formData.address_1} onChange={handleChange} required />
        </div>
        <div className="col-12">
          <label className="form-label">Address Line 2</label>
          <input type="text" className="form-control" name="address_2" value={formData.address_2} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label className="form-label">City *</label>
          <input type="text" className="form-control" name="city" value={formData.city} onChange={handleChange} required />
        </div>
        <div className="col-md-4">
          <label className="form-label">State/Province *</label>
          <input type="text" className="form-control" name="state_province" value={formData.state_province} onChange={handleChange} required />
        </div>
        <div className="col-md-4">
          <label className="form-label">ZIP/Postal *</label>
          <input type="text" className="form-control" name="zip_postal" value={formData.zip_postal} onChange={handleChange} required />
        </div>

        {/* Family */}
        <div className="col-12"><h4>Family Information</h4></div>
        <div className="col-md-6">
          <label className="form-label">Spouse Name</label>
          <input type="text" className="form-control" name="spouse_name" value={formData.spouse_name} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Spouse Phone</label>
          <input type="tel" className="form-control" name="spouse_phone" value={formData.spouse_phone} onChange={handleChange} />
        </div>
        <div className="col-12">
          <label className="form-label">Authorized Representative</label>
          <input type="text" className="form-control" name="authorized_rep" value={formData.authorized_rep} onChange={handleChange} />
        </div>
        
        {/* Children */}
        <div className="col-12"><h5>Children</h5></div>
        {[1,2,3,4,5].map(i => (
          <div key={i} className="col-md-6">
            <label className="form-label">Child {i}</label>
            <input type="text" className="form-control" name={`child_${i}`} value={formData[`child_${i}`]} onChange={handleChange} />
          </div>
        ))}
        
        {/* Parents */}
        <div className="col-12"><h5>Parents (Both Sides)</h5></div>
        <div className="col-md-6">
          <label className="form-label">Your Parent 1</label>
          <input type="text" className="form-control" name="parent_1" value={formData.parent_1} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Your Parent 2</label>
          <input type="text" className="form-control" name="parent_2" value={formData.parent_2} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Spouse Parent 1</label>
          <input type="text" className="form-control" name="spouse_parent_1" value={formData.spouse_parent_1} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Spouse Parent 2</label>
          <input type="text" className="form-control" name="spouse_parent_2" value={formData.spouse_parent_2} onChange={handleChange} />
        </div>
        
        {/* Siblings */}
        <div className="col-12"><h5>Siblings</h5></div>
        <div className="col-md-4">
          <label className="form-label">Sibling 1</label>
          <input type="text" className="form-control" name="sibling_1" value={formData.sibling_1} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Sibling 2</label>
          <input type="text" className="form-control" name="sibling_2" value={formData.sibling_2} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Sibling 3</label>
          <input type="text" className="form-control" name="sibling_3" value={formData.sibling_3} onChange={handleChange} />
        </div>

        {/* ID Document */}
        <div className="col-12"><h4>Identification Document</h4></div>
        <div className="col-12">
          <label className="form-label">Minnesota ID or Valid ID *</label>
          <input type="file" className="form-control" onChange={handleFileChange} accept="image/*,.pdf" required />
          <div className="form-text">Upload clear photo/scan of government-issued ID (JPG, PNG, PDF - Max 5MB)</div>
        </div>

        {/* Agreement */}
        <div className="col-12">
          <div className="form-check">
            <input type="checkbox" className="form-check-input" name="constitution_agreed" checked={formData.constitution_agreed} onChange={handleChange} required />
            <label className="form-check-label">I have read the Pamoja Constitution and agree to the conditions *</label>
          </div>
        </div>

        <div className="col-12 text-center">
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Double Family Application'}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default DoubleApplication;