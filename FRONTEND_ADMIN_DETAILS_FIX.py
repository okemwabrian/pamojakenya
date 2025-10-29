# FRONTEND ADMIN DETAILS FIX

# Backend is updated but frontend not showing details
# Need to update frontend admin component to call correct endpoint and display data

# ===== FRONTEND API CALL FIX =====
FRONTEND_API_FIX = '''
// Update your adminAPI in services/api.js to use the correct endpoint

export const adminAPI = {
  // ... existing methods ...
  
  // Use the CRUD endpoint that returns complete data
  getApplicationDetails: (id) => api.get(`/admin/crud/applications/${id}/`),
  
  // Alternative: Use the ViewSet endpoint
  getApplicationDetailsAlt: (id) => api.get(`/admin/applications/${id}/details/`),
}
'''

# ===== ADMIN COMPONENT UPDATE =====
ADMIN_COMPONENT_UPDATE = '''
// Update your AdminApplications.js or AdminApplicationDetails.js component

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminApplicationDetails = ({ applicationId }) => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      console.log('Fetching application details for ID:', applicationId);
      
      // Use the CRUD endpoint that returns complete data
      const response = await adminAPI.getApplicationDetails(applicationId);
      console.log('Application details response:', response.data);
      
      setApplication(response.data.application || response.data);
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading application details...</div>;
  }

  if (!application) {
    return <div className="text-center py-4">Application not found</div>;
  }

  return (
    <div className="container py-4">
      <h3>Application Details</h3>
      
      {/* Application Info */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Application Info</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Type:</strong> {application.membership_type} Membership</p>
              <p><strong>Status:</strong> 
                <span className={`badge ms-2 ${
                  application.status === 'approved' ? 'bg-success' :
                  application.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                }`}>
                  {application.status}
                </span>
              </p>
            </div>
            <div className="col-md-6">
              <p><strong>Submitted:</strong> {new Date(application.created_at).toLocaleDateString()}</p>
              <p><strong>User:</strong> {application.user}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Applicant */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Primary Applicant</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Name:</strong> {application.first_name} {application.last_name}</p>
              <p><strong>Email:</strong> {application.email}</p>
              <p><strong>Phone:</strong> {application.phone}</p>
            </div>
            <div className="col-md-6">
              <p><strong>DOB:</strong> {application.date_of_birth}</p>
              <p><strong>ID Number:</strong> {application.id_number || application.national_id}</p>
              <p><strong>Gender:</strong> {application.gender}</p>
              <p><strong>Occupation:</strong> {application.occupation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Address</h5>
        </div>
        <div className="card-body">
          <p>{application.address}</p>
          <p>{application.city}, {application.state} {application.zip_code}</p>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Emergency Contact</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <p><strong>Name:</strong> {application.emergency_name || application.emergency_contact_name}</p>
            </div>
            <div className="col-md-4">
              <p><strong>Phone:</strong> {application.emergency_phone || application.emergency_contact_phone}</p>
            </div>
            <div className="col-md-4">
              <p><strong>Relationship:</strong> {application.emergency_relationship || application.emergency_contact_relationship}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Spouse Information (for double membership) */}
      {application.membership_type === 'double' && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>Spouse Information</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p><strong>Name:</strong> {application.spouse_first_name} {application.spouse_last_name}</p>
                <p><strong>Email:</strong> {application.spouse_email}</p>
                <p><strong>Phone:</strong> {application.spouse_phone}</p>
              </div>
              <div className="col-md-6">
                <p><strong>DOB:</strong> {application.spouse_date_of_birth}</p>
                <p><strong>ID Number:</strong> {application.spouse_id_number || application.spouse_national_id}</p>
                <p><strong>Occupation:</strong> {application.spouse_occupation}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Children Information */}
      {application.children_info && application.children_info.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>Children Information</h5>
          </div>
          <div className="card-body">
            {application.children_info.map((child, index) => (
              <div key={index} className="border p-3 mb-2 rounded">
                <div className="row">
                  <div className="col-md-4">
                    <p><strong>Name:</strong> {child.name}</p>
                  </div>
                  <div className="col-md-4">
                    <p><strong>DOB:</strong> {child.date_of_birth}</p>
                  </div>
                  <div className="col-md-4">
                    <p><strong>Relationship:</strong> {child.relationship}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Notes */}
      {application.admin_notes && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>Admin Notes</h5>
          </div>
          <div className="card-body">
            <p>{application.admin_notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplicationDetails;
'''

# ===== DEBUG STEPS =====
DEBUG_STEPS = '''
// Add these debug steps to your admin component:

1. Check the API endpoint being called:
   console.log('API URL:', `/admin/crud/applications/${applicationId}/`);

2. Log the response:
   console.log('API Response:', response.data);

3. Check if data exists:
   console.log('Application data:', response.data.application);

4. Verify the endpoint in browser network tab:
   - Open browser dev tools
   - Go to Network tab
   - Click on application details
   - Check if the request is made and what response is returned

5. Test the endpoint directly:
   // In browser console:
   fetch('/api/admin/crud/applications/14/', {
     headers: {
       'Authorization': 'Bearer ' + localStorage.getItem('token')
     }
   })
   .then(r => r.json())
   .then(data => console.log('Direct API test:', data));
'''

# ===== COMMON ISSUES =====
COMMON_ISSUES = '''
// Common reasons why details don't show:

1. Wrong API endpoint:
   ❌ /admin/applications/14/        (generic endpoint)
   ✅ /admin/crud/applications/14/   (detailed endpoint)

2. Wrong data extraction:
   ❌ setApplication(response.data)
   ✅ setApplication(response.data.application)

3. Missing authentication:
   - Check if admin token is valid
   - Verify user has admin permissions

4. Component not re-rendering:
   - Check if useEffect dependencies are correct
   - Verify state is being updated

5. Data structure mismatch:
   - Backend returns different field names
   - Frontend expects different structure
'''

print("FRONTEND ADMIN DETAILS FIX CREATED")
print("=" * 50)
print("STEPS TO FIX:")
print("1. Update API call to use correct endpoint")
print("2. Update component to display all fields")
print("3. Add debug logging to see what data is returned")
print("4. Check browser network tab for API calls")
print("5. Test endpoint directly in browser console")