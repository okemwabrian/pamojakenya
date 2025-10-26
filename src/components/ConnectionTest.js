import React, { useState } from 'react';
import axios from 'axios';

const ConnectionTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'https://Okemwabrianny.pythonanywhere.com/api';

  const testConnection = async (endpoint, method = 'GET', data = null) => {
    try {
      const config = {
        method,
        url: `${API_BASE}${endpoint}`,
        timeout: 10000,
      };

      if (data) {
        config.data = data;
        config.headers = { 'Content-Type': 'application/json' };
      }

      const response = await axios(config);
      return { success: true, status: response.status, data: response.data };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 'Network Error',
        error: error.response?.data || error.message
      };
    }
  };

  const runTests = async () => {
    setLoading(true);
    const testResults = {};

    // Test 1: Basic API connection
    console.log('Testing API connection...');
    testResults.connection = await testConnection('/');

    // Test 2: Test applications endpoint
    console.log('Testing applications endpoint...');
    testResults.applications = await testConnection('/applications/');

    // Test 3: Test POST to single application
    console.log('Testing single application POST...');
    const sampleData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phoneMain: '123-456-7890',
      address1: '123 Test St',
      city: 'Test City',
      stateProvince: 'Test State',
      zip: '12345',
      declarationAccepted: true
    };
    testResults.singleAppPost = await testConnection('/applications/single/submit/', 'POST', sampleData);

    // Test 4: Test activation payment endpoint
    console.log('Testing activation payment endpoint...');
    testResults.activationPayment = await testConnection('/activation-payments/');

    // Test 5: Test shares endpoint
    console.log('Testing shares endpoint...');
    testResults.shares = await testConnection('/shares/');

    setResults(testResults);
    setLoading(false);
  };

  const getStatusColor = (result) => {
    if (!result) return 'secondary';
    if (result.success) return 'success';
    if (result.status === 404) return 'warning';
    return 'danger';
  };

  const getStatusText = (result) => {
    if (!result) return 'Not tested';
    if (result.success) return `✅ Success (${result.status})`;
    return `❌ Failed (${result.status})`;
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h4 className="mb-0">🔗 Backend Connection Test</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>API Base URL:</strong> 
                <code className="ms-2">{API_BASE}</code>
              </div>

              <button 
                className="btn btn-primary mb-4" 
                onClick={runTests}
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Run Connection Tests'}
              </button>

              {Object.keys(results).length > 0 && (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Test</th>
                        <th>Endpoint</th>
                        <th>Status</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>API Connection</td>
                        <td><code>/</code></td>
                        <td>
                          <span className={`badge bg-${getStatusColor(results.connection)}`}>
                            {getStatusText(results.connection)}
                          </span>
                        </td>
                        <td>
                          {results.connection?.error && (
                            <small className="text-danger">
                              {JSON.stringify(results.connection.error)}
                            </small>
                          )}
                        </td>
                      </tr>
                      
                      <tr>
                        <td>Applications GET</td>
                        <td><code>/applications/</code></td>
                        <td>
                          <span className={`badge bg-${getStatusColor(results.applications)}`}>
                            {getStatusText(results.applications)}
                          </span>
                        </td>
                        <td>
                          {results.applications?.error && (
                            <small className="text-danger">
                              {JSON.stringify(results.applications.error)}
                            </small>
                          )}
                        </td>
                      </tr>

                      <tr>
                        <td>Single App POST</td>
                        <td><code>/applications/single/submit/</code></td>
                        <td>
                          <span className={`badge bg-${getStatusColor(results.singleAppPost)}`}>
                            {getStatusText(results.singleAppPost)}
                          </span>
                        </td>
                        <td>
                          {results.singleAppPost?.error && (
                            <small className="text-danger">
                              {JSON.stringify(results.singleAppPost.error)}
                            </small>
                          )}
                        </td>
                      </tr>

                      <tr>
                        <td>Activation Payments</td>
                        <td><code>/activation-payments/</code></td>
                        <td>
                          <span className={`badge bg-${getStatusColor(results.activationPayment)}`}>
                            {getStatusText(results.activationPayment)}
                          </span>
                        </td>
                        <td>
                          {results.activationPayment?.error && (
                            <small className="text-danger">
                              {JSON.stringify(results.activationPayment.error)}
                            </small>
                          )}
                        </td>
                      </tr>

                      <tr>
                        <td>Shares</td>
                        <td><code>/shares/</code></td>
                        <td>
                          <span className={`badge bg-${getStatusColor(results.shares)}`}>
                            {getStatusText(results.shares)}
                          </span>
                        </td>
                        <td>
                          {results.shares?.error && (
                            <small className="text-danger">
                              {JSON.stringify(results.shares.error)}
                            </small>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4">
                <h6>Expected Results:</h6>
                <ul className="list-unstyled">
                  <li>✅ <strong>Success (200):</strong> Endpoint working correctly</li>
                  <li>⚠️ <strong>Failed (404):</strong> Endpoint not found - needs backend setup</li>
                  <li>⚠️ <strong>Failed (405):</strong> Method not allowed - check HTTP method</li>
                  <li>❌ <strong>Network Error:</strong> CORS issue or server down</li>
                </ul>
              </div>

              {loading && (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Testing...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;