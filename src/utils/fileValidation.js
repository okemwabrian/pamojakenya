// File Upload Validation Utility
export const validateFileUpload = (fileInput, maxSizeMB = 5) => {
  if (!fileInput.files || !fileInput.files[0]) {
    return { valid: false, message: 'Please select a file' };
  }
  
  const file = fileInput.files[0];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return { valid: false, message: `File size must be less than ${maxSizeMB}MB` };
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: 'Only JPEG, PNG, and PDF files are allowed' };
  }
  
  return { valid: true, message: 'File is valid' };
};

// Enhanced error handling utility
export const handleApiResponse = async (apiCall) => {
  try {
    const { response, data } = await apiCall();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      // Handle different error types
      if (response.status === 400) {
        // Validation errors
        const errorMessages = [];
        Object.keys(data).forEach(field => {
          if (Array.isArray(data[field])) {
            errorMessages.push(`${field}: ${data[field].join(', ')}`);
          } else {
            errorMessages.push(`${field}: ${data[field]}`);
          }
        });
        return { success: false, error: errorMessages.join('\n') };
      } else if (response.status === 401) {
        return { success: false, error: 'Please log in again' };
      } else if (response.status === 403) {
        return { success: false, error: 'Permission denied' };
      } else if (response.status === 404) {
        return { success: false, error: 'Resource not found' };
      } else if (response.status === 415) {
        return { success: false, error: 'Invalid file format or missing Content-Type' };
      } else {
        return { success: false, error: 'Server error. Please try again.' };
      }
    }
  } catch (error) {
    return { success: false, error: 'Network error. Please check your connection.' };
  }
};