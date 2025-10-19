import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
});

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
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Token expired, clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getUser: () => api.get('/auth/user/'),
  updateUser: (data) => api.put('/auth/user/', data),
};

// Applications API calls
export const applicationAPI = {
  getApplications: () => api.get('/applications/'),
  createApplication: (data) => api.post('/applications/', data),
  getApplication: (id) => api.get(`/applications/${id}/`),
  approveApplication: (id, data) => api.post(`/applications/${id}/approve/`, data),
  rejectApplication: (id, data) => api.post(`/applications/${id}/reject/`, data),
};

// Payments API calls
export const paymentsAPI = {
  getPayments: () => api.get('/payments/'),
  createPayment: (data) => api.post('/payments/', data),
  getPayment: (id) => api.get(`/payments/${id}/`),
};

// Claims API calls
export const claimsAPI = {
  getClaims: () => api.get('/claims/'),
  createClaim: (data) => api.post('/claims/', data),
  getClaim: (id) => api.get(`/claims/${id}/`),
  approveClaim: (id, data) => api.post(`/claims/${id}/approve/`, data),
  rejectClaim: (id, data) => api.post(`/claims/${id}/reject/`, data),
};

// Documents API calls
export const documentsAPI = {
  getDocuments: () => api.get('/documents/'),
  createDocument: (data) => api.post('/documents/', data),
  getDocument: (id) => api.get(`/documents/${id}/`),
};

// Shares API calls
export const sharesAPI = {
  getShares: () => api.get('/shares/'),
  createShare: (data) => api.post('/shares/', data),
  getShare: (id) => api.get(`/shares/${id}/`),
};

// Admin API calls
export const adminAPI = {
  // Use same endpoints as regular users - ViewSets handle permissions
  getApplications: () => api.get('/applications/'),
  approveApplication: (id, data) => api.post(`/applications/${id}/approve/`, data),
  rejectApplication: (id, data) => api.post(`/applications/${id}/reject/`, data),
  
  getClaims: () => api.get('/claims/'),
  approveClaim: (id, data) => api.post(`/claims/${id}/approve/`, data),
  rejectClaim: (id, data) => api.post(`/claims/${id}/reject/`, data),
  
  getPayments: () => api.get('/payments/'),
  approvePayment: (id, data) => api.post(`/payments/${id}/approve/`, data),
  rejectPayment: (id, data) => api.post(`/payments/${id}/reject/`, data),
  
  getDocuments: () => api.get('/documents/'),
  getShares: () => api.get('/shares/'),
  
  deleteApplication: (id) => api.delete(`/applications/${id}/`),
  deleteClaim: (id) => api.delete(`/claims/${id}/`),
  deletePayment: (id) => api.delete(`/payments/${id}/`),
};

export default api;