import axios from 'axios';

// Ensure we always use PythonAnywhere backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://Okemwabrianny.pythonanywhere.com/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  // Don't set Content-Type header - let axios handle it for file uploads
});

// Debug: Log the API base URL
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Token expired, clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Don't redirect automatically, let components handle it
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  getUser: () => api.get('/auth/user/'),
  updateUser: (data) => api.put('/auth/user/', data),
  getDashboardStats: () => api.get('/auth/dashboard/dashboard_stats/'),
};

// Applications API calls
export const applicationAPI = {
  getApplications: () => api.get('/applications/'),
  createApplication: (data) => {
    return api.post('/applications/', data);
  },
  submitSingle: (formData) => {
    return api.post('/applications/single/submit/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  submitDouble: (formData) => {
    return api.post('/applications/double/submit/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  submitPayment: (data) => api.post('/applications/submit-payment/', data),
  getApplication: (id) => api.get(`/applications/${id}/`),
  updateApplication: (id, data) => api.put(`/applications/${id}/`, data),
  deleteApplication: (id) => api.delete(`/applications/${id}/`),
  approveApplication: (id) => api.post(`/applications/${id}/approve/`),
  rejectApplication: (id) => api.post(`/applications/${id}/reject/`),
};

// Payments API calls
export const paymentsAPI = {
  getPayments: () => api.get('/payments/'),
  createPayment: (data) => api.post('/payments/', data),
  getPayment: (id) => api.get(`/payments/${id}/`),
  updatePayment: (id, data) => api.put(`/payments/${id}/`, data),
  submitActivationFee: (data) => api.post('/payments/activation/submit/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getActivationPayments: () => api.get('/activation-payments/'),
};

// Shares API calls
export const sharesAPI = {
  getShares: () => api.get('/shares/'),
  createShare: (data) => api.post('/shares/', data),
  buyShares: (data) => api.post('/shares/buy/', data),
  getShare: (id) => api.get(`/shares/${id}/`),
  getSharePurchases: () => api.get('/shares/'),
};

// Claims API calls
export const claimsAPI = {
  getClaims: () => api.get('/claims/'),
  createClaim: (data) => {
    return api.post('/claims/', data);
  },
  getClaim: (id) => api.get(`/claims/${id}/`),
  updateClaim: (id, data) => api.put(`/claims/${id}/`, data),
  approveClaim: (id) => api.post(`/claims/${id}/approve/`),
  rejectClaim: (id) => api.post(`/claims/${id}/reject/`),
};

// Documents API calls
export const documentsAPI = {
  getDocuments: () => api.get('/documents/'),
  createDocument: (data) => api.post('/documents/', data),
  uploadDocument: (formData) => {
    return api.post('/documents/', formData);
  },
  getDocument: (id) => api.get(`/documents/${id}/`),
  deleteDocument: (id) => api.delete(`/documents/${id}/`),
  approveDocument: (id) => api.post(`/documents/${id}/approve/`),
  rejectDocument: (id) => api.post(`/documents/${id}/reject/`),
};

// Announcements API calls
export const announcementsAPI = {
  getAnnouncements: () => api.get('/announcements/'),
  createAnnouncement: (data) => api.post('/announcements/', data),
  getAnnouncement: (id) => api.get(`/announcements/${id}/`),
  updateAnnouncement: (id, data) => api.put(`/announcements/${id}/`, data),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}/`),
};

// Meetings API calls
export const meetingsAPI = {
  getMeetings: () => api.get('/meetings/'),
  createMeeting: (data) => api.post('/meetings/', data),
  getMeeting: (id) => api.get(`/meetings/${id}/`),
  updateMeeting: (id, data) => api.put(`/meetings/${id}/`, data),
  deleteMeeting: (id) => api.delete(`/meetings/${id}/`),
  registerForMeeting: (id) => api.post(`/meetings/${id}/register/`),
};

// Contact API calls
export const contactAPI = {
  getMessages: () => api.get('/contact/'),
  sendMessage: (data) => api.post('/contact/', data),
  getMessage: (id) => api.get(`/contact/${id}/`),
  getMyMessages: () => api.get('/contact/'),
};

// User API calls (for profile management)
export const userAPI = {
  getProfile: () => api.get('/auth/user/'),
  updateProfile: (data) => api.put('/auth/user/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  getUser: () => api.get('/users/me/'),
  updateUser: (data) => api.put('/users/me/', data),
};

// Admin API calls
export const adminAPI = {
  // Users management
  getAllUsers: () => api.get('/admin/users/'),
  getUsers: () => api.get('/admin/users/'),
  getUser: (id) => api.get(`/admin/users/${id}/`),
  updateUser: (id, data) => api.put(`/admin/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}/`),
  toggleMembership: (id) => api.post(`/admin/users/${id}/toggle_membership/`),
  activateUser: (id) => api.post(`/admin/users/${id}/activate_user/`),
  deactivateUser: (id, reason) => api.post(`/admin/users/${id}/deactivate_user/`, { reason }),
  updateShares: (id, data) => api.post(`/admin/users/${id}/update_shares/`, data),
  resetPassword: (id) => api.post(`/admin/users/${id}/reset_password/`),
  getStats: () => api.get('/admin/users/stats/'),
  getRegisteredUsers: () => api.get('/admin/users/registered_users/'),
  
  // Applications management
  getApplications: () => api.get('/admin/applications/'),
  getApplication: (id) => api.get(`/admin/applications/${id}/`),
  getApplicationDetails: (id) => api.get(`/admin/applications/${id}/details/`),
  updateApplication: (id, data) => api.put(`/admin/applications/${id}/`, data),
  verifyPayment: (id, data) => api.post(`/applications/${id}/verify_payment/`, data),
  approveApplication: (id) => api.post(`/applications/${id}/approve/`),
  rejectApplication: (id) => api.post(`/applications/${id}/reject/`),
  viewPaymentProof: (id) => api.get(`/admin/applications/${id}/payment-proof/`),
  
  // Claims management
  getClaims: () => api.get('/admin/claims/'),
  getClaim: (id) => api.get(`/admin/claims/${id}/`),
  updateClaim: (id, data) => api.put(`/admin/claims/${id}/`, data),
  approveClaim: (id, data) => api.post(`/admin/claims/${id}/approve/`, data),
  rejectClaim: (id) => api.post(`/admin/claims/${id}/reject/`),
  
  // Payments management
  getPayments: () => api.get('/admin/payments/'),
  getPayment: (id) => api.get(`/admin/payments/${id}/`),
  updatePayment: (id, data) => api.put(`/admin/payments/${id}/`, data),
  markCompleted: (id) => api.post(`/admin/payments/${id}/mark_completed/`),
  
  // Contact messages management
  getContactMessages: () => api.get('/admin/contact/'),
  getContactMessage: (id) => api.get(`/admin/contact/${id}/`),
  markRead: (id) => api.post(`/admin/contact/${id}/mark_read/`),
  replyToMessage: (id, reply) => api.post(`/admin/contact/${id}/reply/`, { reply }),
  markReplied: (id) => api.post(`/admin/contact/${id}/mark_replied/`),
  
  // Shares management
  getShares: () => api.get('/admin/shares/'),
  getShare: (id) => api.get(`/admin/shares/${id}/`),
  approveSharePurchase: (id, data) => api.post(`/admin/shares/${id}/approve/`, data),
  rejectSharePurchase: (id, data) => api.post(`/admin/shares/${id}/reject`, data),
  
  // Payment management
  approvePayment: (id, data) => api.post(`/admin/payments/${id}/approve_payment/`, data),
  rejectPayment: (id, data) => api.post(`/admin/payments/${id}/reject_payment/`, data),
  getFinancialReport: () => api.get('/admin/payments/financial_report/'),
  getSharesReport: () => api.get('/admin/payments/shares_report/'),
  
  // Meeting registrations
  getMeetingRegistrations: (id) => api.get(`/admin/meetings/${id}/registrations/`),
  
  // Payment types
  getPaymentTypes: () => Promise.resolve({
    data: [
      { value: 'membership_single', label: 'Single Membership Fee' },
      { value: 'membership_double', label: 'Double Membership Fee' },
      { value: 'activation_fee', label: 'Activation Fee' },
      { value: 'shares', label: 'Share Purchase' },
      { value: 'other', label: 'Other' }
    ]
  }),
  
  // Share deduction with email
  deductSharesAll: (data) => api.post('/admin/contact/deduct_shares_all/', data),
  
  // Documents management
  getDocuments: () => api.get('/admin/documents/'),
  getDocument: (id) => api.get(`/admin/documents/${id}/`),
  
  // Meetings management
  getMeetings: () => api.get('/admin/meetings/'),
  getMeeting: (id) => api.get(`/admin/meetings/${id}/`),
  createMeeting: (data) => api.post('/admin/meetings/', data),
  updateMeeting: (id, data) => api.put(`/admin/meetings/${id}/`, data),
  deleteMeeting: (id) => api.delete(`/admin/meetings/${id}/`),
};

// Beneficiaries API calls
export const beneficiariesAPI = {
  getBeneficiaries: () => api.get('/beneficiaries/'),
  createBeneficiary: (data) => api.post('/beneficiaries/', data),
  createChangeRequest: (data) => api.post('/beneficiaries/change-request/', data),
  getBeneficiary: (id) => api.get(`/beneficiaries/${id}/`),
  updateBeneficiary: (id, data) => api.put(`/beneficiaries/${id}/`, data),
  deleteBeneficiary: (id) => api.delete(`/beneficiaries/${id}/`),
};

// Events API calls (using meetings endpoint)
export const eventsAPI = {
  getEvents: () => api.get('/meetings/'),
  createEvent: (data) => api.post('/meetings/', data),
  updateEvent: (id, data) => api.put(`/meetings/${id}/`, data),
  deleteEvent: (id) => api.delete(`/meetings/${id}/`),
};

export default api;