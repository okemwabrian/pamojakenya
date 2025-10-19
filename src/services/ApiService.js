// Enhanced API Service Class for Pamoja Frontend
import { paymentsAPI, claimsAPI, adminAPI } from './api';

class ApiService {
  // Payment methods
  async createPayment(paymentData) {
    try {
      const formData = new FormData();
      Object.keys(paymentData).forEach(key => {
        if (paymentData[key] !== null && paymentData[key] !== undefined) {
          formData.append(key, paymentData[key]);
        }
      });
      
      const response = await paymentsAPI.createPayment(formData);
      return { response: { ok: true }, data: response.data };
    } catch (error) {
      return { 
        response: { ok: false, status: error.response?.status }, 
        data: error.response?.data || { error: error.message }
      };
    }
  }

  // Claims methods
  async createClaim(claimData) {
    try {
      const formData = new FormData();
      Object.keys(claimData).forEach(key => {
        if (claimData[key] !== null && claimData[key] !== undefined) {
          formData.append(key, claimData[key]);
        }
      });
      
      const response = await claimsAPI.createClaim(formData);
      return { response: { ok: true }, data: response.data };
    } catch (error) {
      return { 
        response: { ok: false, status: error.response?.status }, 
        data: error.response?.data || { error: error.message }
      };
    }
  }

  // Admin payment approval methods
  async approvePayment(paymentId, notes = '') {
    try {
      const response = await adminAPI.approvePayment(paymentId, { notes });
      return { response: { ok: true }, data: response.data };
    } catch (error) {
      return { 
        response: { ok: false, status: error.response?.status }, 
        data: error.response?.data || { error: error.message }
      };
    }
  }

  async rejectPayment(paymentId, notes = '') {
    try {
      const response = await adminAPI.rejectPayment(paymentId, { notes });
      return { response: { ok: true }, data: response.data };
    } catch (error) {
      return { 
        response: { ok: false, status: error.response?.status }, 
        data: error.response?.data || { error: error.message }
      };
    }
  }
}

export default ApiService;