import React, { useState } from 'react';
import { adminAPI } from '../../services/api';
import axios from 'axios';

const AdminDebug = () => {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testDebugEndpoint = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/api/admin/debug/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      setDebugData(response.data);
    } catch (err) {
      setError(err.response?.data || err.message);
      console.error('Debug endpoint error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testAdminEndpoints = async () => {
    setLoading(true);
    setError(null);
    
    const endpoints = [
      { name: 'Users', call: () => adminAPI.getUsers() },
      { name: 'Applications', call: () => adminAPI.getApplications() },
      { name: 'Claims', call: () => adminAPI.getClaims() },
      { name: 'Payments', call: () => adminAPI.getPayments() },
      { name: 'Contact', call: () => adminAPI.getContactMessages() }
    ];

    const results = {};
    
    for (const endpoint of endpoints) {
      try {
        const response = await endpoint.call();
        results[endpoint.name] = {
          success: true,
          count: Array.isArray(response.data) ? response.data.length : 'N/A',
          data: response.data
        };
      } catch (err) {
        results[endpoint.name] = {
          success: false,
          error: err.response?.data || err.message
        };
      }
    }
    
    setDebugData({ endpoint_tests: results });
    setLoading(false);
  };

  return (
    <div className="container-fluid py-4">
      <h3>🔧 Admin Debug Panel</h3>
      
      <div className="row g-3 mb-4">
        <div className="col-auto">
          <button 
            className="btn btn-primary" 
            onClick={testDebugEndpoint}
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test Debug Endpoint'}
          </button>
        </div>
        <div className="col-auto">
          <button 
            className="btn btn-secondary" 
            onClick={testAdminEndpoints}
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test All Admin Endpoints'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <h5>Error:</h5>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {debugData && (
        <div className="card">
          <div className="card-header">
            <h5>Debug Results</h5>
          </div>
          <div className="card-body">
            <pre style={{fontSize: '12px', maxHeight: '500px', overflow: 'auto'}}>
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-4">
        <h5>Current Token Info:</h5>
        <div className="card">
          <div className="card-body">
            <p><strong>Token exists:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
            <p><strong>Token preview:</strong> {localStorage.getItem('token')?.substring(0, 20)}...</p>
            <p><strong>API Base URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDebug;