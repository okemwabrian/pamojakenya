import React from 'react';

const PaymentInstructions = ({ paymentMethod, amount }) => {
  const paymentDetails = {
    paypal: {
      label: 'PayPal',
      details: 'pamojakeny@gmail.com',
      icon: 'bi-paypal',
      color: 'primary'
    },
    mpesa: {
      label: 'M-Pesa',
      details: '+254700000000',
      icon: 'bi-phone',
      color: 'success'
    },
    bank: {
      label: 'Bank Transfer',
      details: 'Account: 1234567890, ABC Bank',
      icon: 'bi-bank',
      color: 'info'
    }
  };

  const details = paymentDetails[paymentMethod];
  if (!details) return null;

  return (
    <div className={`alert alert-${details.color} mb-3`}>
      <h6 className="fw-bold mb-2">
        <i className={`${details.icon} me-2`}></i>
        {details.label} Payment Instructions
      </h6>
      <div className="mb-2">
        <strong>Amount:</strong> ${amount}
      </div>
      <div className="mb-2">
        <strong>Send to:</strong> {details.details}
      </div>
      <small className="text-muted">
        After payment, enter your transaction ID below for verification.
      </small>
    </div>
  );
};

export default PaymentInstructions;