import React, { useState } from 'react';
import { authAPI } from '../services/api';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Not tested');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test with a simple API call
      await authAPI.login({ username: 'test', password: 'test' });
      setStatus('✅ Connected - Backend is reachable');
    } catch (error) {
      if (error.response) {
        setStatus('✅ Connected - Backend is reachable (got response)');
      } else if (error.request) {
        setStatus('❌ Connection Failed - Backend not reachable');
      } else {
        setStatus('❌ Error - ' + error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="card mt-3">
      <div className="card-body">
        <h5>Backend Connection Test</h5>
        <p>Status: {status}</p>
        <button 
          className="btn btn-primary" 
          onClick={testConnection}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
      </div>
    </div>
  );
};

export default ConnectionTest;