import React from 'react';
import { getPaymentInstructions } from '../config/paymentMethods';

const PaymentInstructions = ({ paymentMethod, amount }) => {
  const details = getPaymentInstructions(paymentMethod, amount);
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