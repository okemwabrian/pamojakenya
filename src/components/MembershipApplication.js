import React, { useState } from 'react';
import { applicationAPI } from '../services/api';
import { useSnackbar } from '../hooks/useSnackbar';
import Snackbar from './Snackbar';

const MembershipApplication = () => {
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const [step, setStep] = useState(1);
  const [membershipType, setMembershipType] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Primary applicant
    first_name: '', last_name: '', email: '', phone: '', date_of_birth: '',
    id_number: '', address: '', city: '', state: '', zip_code: '',
    emergency_name: '', emergency_phone: '', emergency_relationship: '',
    
    // Spouse (for double membership)
    spouse_first_name: '', spouse_last_name: '', spouse_email: '', spouse_phone: '',
    spouse_date_of_birth: '', spouse_id_number: '',
    
    // Children
    children_info: []
  });
  
  const [files, setFiles] = useState({
    id_document: null,
    spouse_id_document: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles(prev => ({ ...prev, [name]: fileList[0] }));
  };

  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      children_info: [...prev.children_info, { name: '', date_of_birth: '', relationship: 'child' }]
    }));
  };

  const removeChild = (index) => {
    setFormData(prev => ({
      ...prev,
      children_info: prev.children_info.filter((_, i) => i !== index)
    }));
  };

  const updateChild = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      children_info: prev.children_info.map((child, i) => 
        i === index ? { ...child, [field]: value } : child
      )
    }));
  };

  const validateForm = () => {
    const required = [
      'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
      'id_number', 'address', 'city', 'state', 'zip_code',
      'emergency_name', 'emergency_phone', 'emergency_relationship'
    ];
    
    const missing = required.filter(field => !formData[field]);
    
    if (membershipType === 'double') {
      const doubleRequired = [
        'spouse_first_name', 'spouse_last_name', 
        'spouse_date_of_birth', 'spouse_id_number'
      ];
      missing.push(...doubleRequired.filter(field => !formData[field]));
    }
    
    if (missing.length > 0) {
      showError(`Please fill in: ${missing.join(', ')}`);
      return false;
    }
    
    if (!files.id_document) {
      showError('Please upload ID document');
      return false;
    }
    
    if (membershipType === 'double' && !files.spouse_id_document) {
      showError('Please upload spouse ID document');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const submitData = new FormData();
      
      console.log('Submitting application:', { formData, membershipType, files });
      
      // Add membership type first
      submitData.append('membership_type', membershipType);
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (key === 'children_info') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add files
      if (files.id_document) {
        submitData.append('id_document', files.id_document);
      }
      if (files.spouse_id_document && membershipType === 'double') {
        submitData.append('spouse_id_document', files.spouse_id_document);
      }

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      await applicationAPI.createApplication(submitData);
      
      showSuccess('Application submitted successfully!');
      
      // Reset form
      setFormData({
        first_name: '', last_name: '', email: '', phone: '', date_of_birth: '',
        id_number: '', address: '', city: '', state: '', zip_code: '',
        emergency_name: '', emergency_phone: '', emergency_relationship: '',
        spouse_first_name: '', spouse_last_name: '', spouse_email: '', spouse_phone: '',
        spouse_date_of_birth: '', spouse_id_number: '',
        children_info: []
      });
      setFiles({ id_document: null, spouse_id_document: null });
      setStep(1);
      
    } catch (error) {
      console.error('Application error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMsg = error.response?.data ? 
        JSON.stringify(error.response.data, null, 2) : 
        'Failed to submit application. Please try again.';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header text-center">
                <h2>🎯 2025 Membership Registration</h2>
                <p className="mb-0">Pamoja Kenya is more than just giving — it's building a united community.</p>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <h5>📅 Important Dates</h5>
                  <p>Enrollment opens on January 1st and closes at midnight on January 24th.</p>
                </div>
                
                <h5>Two-Step Membership Process</h5>
                <ol>
                  <li><strong>Step 1:</strong> Read the By-laws / Constitution</li>
                  <li><strong>Step 2:</strong> Choose your membership type and submit your application</li>
                </ol>
                
                <p>Once your application and initial payment are received, you'll get a confirmation email. Your membership will be activated upon approval.</p>
                
                <div className="row g-3 mt-4">
                  <div className="col-md-6">
                    <div className="card h-100 border-primary">
                      <div className="card-body text-center">
                        <h5 className="card-title">👤 Single Membership</h5>
                        <p className="card-text">Individual membership for one person</p>
                        <ul className="list-unstyled">
                          <li>✓ Full voting rights</li>
                          <li>✓ Benefit eligibility</li>
                          <li>✓ Community participation</li>
                        </ul>
                        <button 
                          className="btn btn-primary"
                          onClick={() => {
                            setMembershipType('single');
                            setStep(2);
                          }}
                        >
                          Apply for Single
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card h-100 border-success">
                      <div className="card-body text-center">
                        <h5 className="card-title">👥 Double Membership</h5>
                        <p className="card-text">Family membership for couples</p>
                        <ul className="list-unstyled">
                          <li>✓ Two voting rights</li>
                          <li>✓ Enhanced benefits</li>
                          <li>✓ Family coverage</li>
                        </ul>
                        <button 
                          className="btn btn-success"
                          onClick={() => {
                            setMembershipType('double');
                            setStep(2);
                          }}
                        >
                          Apply for Double
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card">
            <div className="card-header">
              <h3>{membershipType === 'single' ? '👤 Single' : '👥 Double'} Membership Application</h3>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setStep(1)}
              >
                ← Back to Selection
              </button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Primary Applicant */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">Primary Applicant Information</h5>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">First Name *</label>
                    <input type="text" className="form-control" name="first_name" 
                           value={formData.first_name} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name *</label>
                    <input type="text" className="form-control" name="last_name" 
                           value={formData.last_name} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" name="email" 
                           value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone *</label>
                    <input type="tel" className="form-control" name="phone" 
                           value={formData.phone} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date of Birth *</label>
                    <input type="date" className="form-control" name="date_of_birth" 
                           value={formData.date_of_birth} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">ID Number *</label>
                    <input type="text" className="form-control" name="id_number" 
                           value={formData.id_number} onChange={handleInputChange} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">ID Document *</label>
                    <input type="file" className="form-control" name="id_document" 
                           onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" required />
                  </div>
                </div>

                {/* Address */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">Address Information</h5>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address *</label>
                    <textarea className="form-control" name="address" rows="2"
                              value={formData.address} onChange={handleInputChange} required></textarea>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">City *</label>
                    <input type="text" className="form-control" name="city" 
                           value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">State *</label>
                    <input type="text" className="form-control" name="state" 
                           value={formData.state} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">ZIP Code *</label>
                    <input type="text" className="form-control" name="zip_code" 
                           value={formData.zip_code} onChange={handleInputChange} required />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">Emergency Contact</h5>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Name *</label>
                    <input type="text" className="form-control" name="emergency_name" 
                           value={formData.emergency_name} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Phone *</label>
                    <input type="tel" className="form-control" name="emergency_phone" 
                           value={formData.emergency_phone} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Relationship *</label>
                    <select className="form-select" name="emergency_relationship" 
                            value={formData.emergency_relationship} onChange={handleInputChange} required>
                      <option value="">Select...</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="child">Child</option>
                      <option value="friend">Friend</option>
                    </select>
                  </div>
                </div>

                {/* Spouse Information (Double Membership Only) */}
                {membershipType === 'double' && (
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="border-bottom pb-2">Spouse Information</h5>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Spouse First Name *</label>
                      <input type="text" className="form-control" name="spouse_first_name" 
                             value={formData.spouse_first_name} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Spouse Last Name *</label>
                      <input type="text" className="form-control" name="spouse_last_name" 
                             value={formData.spouse_last_name} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Spouse Email</label>
                      <input type="email" className="form-control" name="spouse_email" 
                             value={formData.spouse_email} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Spouse Phone</label>
                      <input type="tel" className="form-control" name="spouse_phone" 
                             value={formData.spouse_phone} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Spouse Date of Birth *</label>
                      <input type="date" className="form-control" name="spouse_date_of_birth" 
                             value={formData.spouse_date_of_birth} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Spouse ID Number *</label>
                      <input type="text" className="form-control" name="spouse_id_number" 
                             value={formData.spouse_id_number} onChange={handleInputChange} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Spouse ID Document *</label>
                      <input type="file" className="form-control" name="spouse_id_document" 
                             onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" required />
                    </div>
                  </div>
                )}

                {/* Children Information */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">Children Information (Optional)</h5>
                    <button type="button" className="btn btn-outline-primary btn-sm mb-3" onClick={addChild}>
                      + Add Child
                    </button>
                  </div>
                  {formData.children_info.map((child, index) => (
                    <div key={index} className="col-12 mb-3 p-3 border rounded">
                      <div className="row">
                        <div className="col-md-4">
                          <label className="form-label">Child Name</label>
                          <input type="text" className="form-control" 
                                 value={child.name} 
                                 onChange={(e) => updateChild(index, 'name', e.target.value)} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Date of Birth</label>
                          <input type="date" className="form-control" 
                                 value={child.date_of_birth} 
                                 onChange={(e) => updateChild(index, 'date_of_birth', e.target.value)} />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Relationship</label>
                          <select className="form-select" 
                                  value={child.relationship} 
                                  onChange={(e) => updateChild(index, 'relationship', e.target.value)}>
                            <option value="child">Child</option>
                            <option value="stepchild">Stepchild</option>
                            <option value="adopted">Adopted Child</option>
                          </select>
                        </div>
                        <div className="col-md-1">
                          <label className="form-label">&nbsp;</label>
                          <button type="button" className="btn btn-danger btn-sm d-block" 
                                  onClick={() => removeChild(index)}>
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Application & Proceed to Payment'}
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

export default MembershipApplication;