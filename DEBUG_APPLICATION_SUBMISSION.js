// DEBUG APPLICATION SUBMISSION

// 1. ADD CONSOLE LOGGING TO MembershipApplication.js
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const submitData = new FormData();
    
    // Log what we're sending
    console.log('Form Data:', formData);
    console.log('Files:', files);
    console.log('Membership Type:', membershipType);
    
    // Add form data
    Object.keys(formData).forEach(key => {
      if (key === 'children_info') {
        const childrenJson = JSON.stringify(formData[key]);
        console.log('Children JSON:', childrenJson);
        submitData.append(key, childrenJson);
      } else if (formData[key]) {
        console.log(`Adding ${key}:`, formData[key]);
        submitData.append(key, formData[key]);
      }
    });
    
    submitData.append('membership_type', membershipType);
    console.log('Membership type added:', membershipType);
    
    // Add files
    if (files.id_document) {
      console.log('Adding ID document:', files.id_document.name);
      submitData.append('id_document', files.id_document);
    }
    if (files.spouse_id_document && membershipType === 'double') {
      console.log('Adding spouse ID document:', files.spouse_id_document.name);
      submitData.append('spouse_id_document', files.spouse_id_document);
    }

    // Log all FormData entries
    console.log('FormData entries:');
    for (let [key, value] of submitData.entries()) {
      console.log(key, value);
    }

    const response = await applicationAPI.createApplication(submitData);
    console.log('Response:', response);
    
    showSuccess('Application submitted successfully! Redirecting to payment...');
    
    setTimeout(() => {
      navigate('/payment-instructions', { 
        state: { 
          applicationType: membershipType,
          applicationId: response.data.id 
        }
      });
    }, 2000);
    
  } catch (error) {
    console.error('Full error object:', error);
    console.error('Error response:', error.response);
    console.error('Error data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Show detailed error
    const errorMsg = error.response?.data ? 
      JSON.stringify(error.response.data, null, 2) : 
      error.message;
    showError(`Failed to submit application: ${errorMsg}`);
  } finally {
    setLoading(false);
  }
};

// 2. BACKEND VALIDATION CHECK
// Add this to your Django view to see what's missing:

"""
def create(self, request, *args, **kwargs):
    print("Received data keys:", list(request.data.keys()))
    print("Received files:", list(request.FILES.keys()))
    
    # Check required fields
    required_fields = [
        'membership_type', 'first_name', 'last_name', 'email', 'phone',
        'date_of_birth', 'id_number', 'address', 'city', 'state', 'zip_code',
        'emergency_name', 'emergency_phone', 'emergency_relationship'
    ]
    
    missing_fields = []
    for field in required_fields:
        if field not in request.data or not request.data[field]:
            missing_fields.append(field)
    
    if missing_fields:
        print("Missing required fields:", missing_fields)
        return Response(
            {"error": f"Missing required fields: {missing_fields}"}, 
            status=400
        )
    
    # Check for double membership requirements
    if request.data.get('membership_type') == 'double':
        double_required = [
            'spouse_first_name', 'spouse_last_name', 
            'spouse_date_of_birth', 'spouse_id_number'
        ]
        double_missing = []
        for field in double_required:
            if field not in request.data or not request.data[field]:
                double_missing.append(field)
        
        if double_missing:
            print("Missing double membership fields:", double_missing)
            return Response(
                {"error": f"Missing double membership fields: {double_missing}"}, 
                status=400
            )
    
    return super().create(request, *args, **kwargs)
"""

// 3. COMMON ISSUES TO CHECK:

// A. Make sure all required fields are filled
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
    console.log('Missing fields:', missing);
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

// B. Update handleSubmit to validate first
const handleSubmitWithValidation = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  // ... rest of submit logic
};

console.log('Debug code ready - add console logging to see what data is being sent');