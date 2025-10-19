import React, { useState } from 'react';
import api from '../../services/api';

const ShareCalculator = () => {
  const [shares, setShares] = useState('');
  const [calculation, setCalculation] = useState(null);

  const calculateShares = async () => {
    if (!shares || shares <= 0) return;
    
    try {
      const response = await api.get(`/admin/users/calculator/?shares=${shares}`);
      setCalculation(response.data);
    } catch (error) {
      console.error('Error calculating shares:', error);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Share Calculator</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <label className="form-label">Number of Shares</label>
            <input
              type="number"
              className="form-control"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="Enter number of shares"
              min="1"
            />
          </div>
          <div className="col-md-6 d-flex align-items-end">
            <button 
              className="btn btn-primary"
              onClick={calculateShares}
              disabled={!shares || shares <= 0}
            >
              Calculate
            </button>
          </div>
        </div>
        
        {calculation && (
          <div className="mt-3 p-3 bg-light rounded">
            <h6>Calculation Result:</h6>
            <p><strong>Shares:</strong> {calculation.shares}</p>
            <p><strong>Price per Share:</strong> ${calculation.price_per_share}</p>
            <p><strong>Total Amount:</strong> ${calculation.total_amount}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareCalculator;