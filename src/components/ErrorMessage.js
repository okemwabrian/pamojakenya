import React from 'react';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
      <div className="me-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="m15 9-6 6" stroke="currentColor" strokeWidth="2"/>
          <path d="m9 9 6 6" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
      <div className="flex-grow-1">{message}</div>
      {onClose && (
        <button type="button" className="btn-close" onClick={onClose}></button>
      )}
    </div>
  );
};

export default ErrorMessage;