import React, { useState } from 'react';
import { applicationAPI } from '../services/api';

const SingleApplication = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneMain: '',
    address1: '',
    city: '',
    stateProvince: '',
    zip: '',
    spouse: '',
    spousePhone: '',
    authorizedRep: '',
    child1: '',
    child2: '',
    child3: '',
    child4: '',
    child5: '',
    parent1: '',
    parent2: '',
    spouseParent1: '',
    spouseParent2: '',
    sibling1: '',
    sibling2: '',
    declarationAccepted: false
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileInput = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please upload identification document');
      return;
    }
    
    setIsLoading(true);
    setMessage('');

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      submitData.append('id_document', file);
      
      await applicationAPI.submitSingle(submitData);
      setMessage('Application submitted successfully! You will receive a confirmation email shortly.');
      
      // Reset form
      setFormData({
        firstName: '', middleName: '', lastName: '', email: '', phoneMain: '',
        address1: '', city: '', stateProvince: '', zip: '',
        spouse: '', spousePhone: '', authorizedRep: '',
        child1: '', child2: '', child3: '', child4: '', child5: '',
        parent1: '', parent2: '', spouseParent1: '', spouseParent2: '',
        sibling1: '', sibling2: '', declarationAccepted: false
      });
      setFile(null);
    } catch (error) {
      setMessage('Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Single Family Membership Application</h2>
      
      <div className="application-form">
        <form onSubmit={handleSubmit} className="row g-3">
        {/* Personal Information */}
        <div className="col-12">
          <h3 className="text-primary">Personal Information</h3>
        </div>
        
        <div className="col-md-4">
          <label className="form-label">First Name *</label>
          <input type="text" name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} required />
        </div>
        
        <div className="col-md-4">
          <label className="form-label">Middle Name</label>
          <input type="text" name="middleName" className="form-control" value={formData.middleName} onChange={handleChange} />
        </div>
        
        <div className="col-md-4">
          <label className="form-label">Last Name *</label>
          <input type="text" name="lastName" className="form-control" value={formData.lastName} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label">Email Address *</label>
          <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label">Phone Main *</label>
          <input type="tel" name="phoneMain" className="form-control" value={formData.phoneMain} onChange={handleChange} required />
        </div>

        {/* Address Information */}
        <div className="col-12 mt-4">
          <h3 className="text-primary">Address Information</h3>
        </div>

        <div className="col-12">
          <label className="form-label">Address *</label>
          <input type="text" name="address1" className="form-control" value={formData.address1} onChange={handleChange} required />
        </div>

        <div className="col-md-4">
          <label className="form-label">City *</label>
          <input type="text" name="city" className="form-control" value={formData.city} onChange={handleChange} required />
        </div>

        <div className="col-md-4">
          <label className="form-label">State *</label>
          <input type="text" name="stateProvince" className="form-control" value={formData.stateProvince} onChange={handleChange} required />
        </div>

        <div className="col-md-4">
          <label className="form-label">Zip Code *</label>
          <input type="text" name="zip" className="form-control" value={formData.zip} onChange={handleChange} required />
        </div>

        {/* Family Information */}
        <div className="col-12 mt-4">
          <h3 className="text-primary">Family Information</h3>
        </div>

        <div className="col-md-6">
          <label className="form-label">Spouse / Next of Kin</label>
          <input type="text" name="spouse" className="form-control" value={formData.spouse} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <label className="form-label">Contact Phone (Spouse)</label>
          <input type="tel" name="spousePhone" className="form-control" value={formData.spousePhone} onChange={handleChange} />
        </div>

        <div className="col-12">
          <label className="form-label">Authorized Representative</label>
          <input type="text" name="authorizedRep" className="form-control" value={formData.authorizedRep} onChange={handleChange} />
        </div>

        {/* Children */}
        <div className="col-12 mt-3"><h5>Children</h5></div>
        {[1,2,3,4,5].map(i => (
          <div key={i} className="col-md-6">
            <label className="form-label">Child {i}</label>
            <input type="text" name={`child${i}`} className="form-control" value={formData[`child${i}`]} onChange={handleChange} />
          </div>
        ))}
        
        {/* Parents */}
        <div className="col-12 mt-3"><h5>Parents</h5></div>
        <div className="col-md-6">
          <label className="form-label">Parent 1</label>
          <input type="text" name="parent1" className="form-control" value={formData.parent1} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Parent 2</label>
          <input type="text" name="parent2" className="form-control" value={formData.parent2} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Spouse Parent 1</label>
          <input type="text" name="spouseParent1" className="form-control" value={formData.spouseParent1} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Spouse Parent 2</label>
          <input type="text" name="spouseParent2" className="form-control" value={formData.spouseParent2} onChange={handleChange} />
        </div>
        
        {/* Siblings */}
        <div className="col-12 mt-3"><h5>Siblings</h5></div>
        <div className="col-md-6">
          <label className="form-label">Sibling 1</label>
          <input type="text" name="sibling1" className="form-control" value={formData.sibling1} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Sibling 2</label>
          <input type="text" name="sibling2" className="form-control" value={formData.sibling2} onChange={handleChange} />
        </div>

        {/* Identification Document */}
        <div className="col-12 mt-4">
          <h3 className="text-primary">Identification Document</h3>
        </div>

        <div className="col-12">
          <label className="form-label">Minnesota ID or Any Valid Identification Card *</label>
          <input type="file" className="form-control" onChange={handleFileInput} accept="image/*,.pdf" required />
          <div className="form-text">
            <p>📄 Please upload a clear photo or scan of your Minnesota ID or any valid government-issued identification card.</p>
            <p><small>Accepted formats: JPG, PNG, PDF (Max size: 5MB)</small></p>
          </div>
        </div>

        {/* Agreement */}
        <div className="col-12 mt-4">
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="checkbox" 
              name="declarationAccepted" 
              id="declarationAccepted"
              checked={formData.declarationAccepted}
              onChange={handleChange}
              required 
            />
            <label className="form-check-label" htmlFor="declarationAccepted">
              I have read the Pamoja Constitution and agree to the conditions listed above *
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="col-12 mt-4">
          <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`col-12 alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}
        </form>
      </div>
    </div>
  );
};

export default SingleApplication;