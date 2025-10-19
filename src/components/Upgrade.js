import React, { useState } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { applicationAPI } from '../services/api';

const Upgrade = () => {
  const [formData, setFormData] = useState({
    current_membership: 'single',
    upgrade_to: 'double',
    reason: '',
    additional_members: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const upgradePrice = 75;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPayment(true);
  };

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: { value: upgradePrice },
        description: 'Membership Upgrade - Single to Double Family'
      }]
    });
  };

  const onApprove = async (data, actions) => {
    setLoading(true);
    try {
      const details = await actions.order.capture();
      await applicationAPI.submitDouble({ ...formData, upgrade: true, payment_id: details.id });
      setMessage('Upgrade successful! Your membership has been upgraded to Double Family.');
      setShowPayment(false);
    } catch (err) {
      setMessage('Upgrade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">🔄 Upgrade Membership</h2>
      
      {message && (
        <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Upgrade to Double Family Membership</h5>
              <p className="text-muted">Expand your coverage to include extended family members.</p>
              
              {!showPayment ? (
                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Current Membership</label>
                    <select className="form-select" name="current_membership" value={formData.current_membership} onChange={handleChange}>
                      <option value="single">Single Family</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Upgrade To</label>
                    <select className="form-select" name="upgrade_to" value={formData.upgrade_to} onChange={handleChange}>
                      <option value="double">Double Family</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Additional Family Members</label>
                    <textarea 
                      className="form-control" 
                      rows="3" 
                      name="additional_members" 
                      value={formData.additional_members} 
                      onChange={handleChange}
                      placeholder="List additional family members to be covered..."
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Reason for Upgrade</label>
                    <textarea 
                      className="form-control" 
                      rows="3" 
                      name="reason" 
                      value={formData.reason} 
                      onChange={handleChange}
                      placeholder="Please explain why you want to upgrade..."
                    ></textarea>
                  </div>
                  
                  <div className="col-12">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6>Upgrade Summary</h6>
                        <div className="d-flex justify-content-between">
                          <span>Current: Single Family Membership</span>
                          <span>$150/year</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Upgrade to: Double Family Membership</span>
                          <span>$225/year</span>
                        </div>
                        <hr/>
                        <div className="d-flex justify-content-between fw-bold">
                          <span>Additional Cost:</span>
                          <span>${upgradePrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary">
                      Proceed to Payment
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h6>Complete Your Upgrade Payment</h6>
                  <p>Pay ${upgradePrice} to upgrade to Double Family Membership</p>
                  
                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status"></div>
                      <p className="mt-2">Processing upgrade...</p>
                    </div>
                  ) : (
                    <PayPalButtons
                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={(err) => setMessage('Payment failed. Please try again.')}
                    />
                  )}
                  
                  <button 
                    className="btn btn-secondary mt-3" 
                    onClick={() => setShowPayment(false)}
                  >
                    Back to Form
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;