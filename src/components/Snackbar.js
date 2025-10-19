import React, { useEffect, useState } from 'react';

const Snackbar = ({ message, type = 'info', isVisible, onClose, duration = 4000 }) => {
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsHiding(true);
    setTimeout(() => {
      setIsHiding(false);
      onClose();
    }, 300);
  };

  const getIcon = () => {
    const iconStyle = { fontSize: '20px' };
    switch (type) {
      case 'success':
        return <i className="bi bi-check-circle-fill" style={iconStyle}></i>;
      case 'error':
        return <i className="bi bi-x-circle-fill" style={iconStyle}></i>;
      case 'warning':
        return <i className="bi bi-exclamation-triangle-fill" style={iconStyle}></i>;
      case 'info':
      default:
        return <i className="bi bi-info-circle-fill" style={iconStyle}></i>;
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`snackbar ${type} ${isHiding ? 'hiding' : ''}`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        minWidth: '300px',
        padding: '12px 16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        backgroundColor: type === 'success' ? '#d4edda' : 
                        type === 'error' ? '#f8d7da' :
                        type === 'warning' ? '#fff3cd' : '#d1ecf1',
        color: type === 'success' ? '#155724' :
               type === 'error' ? '#721c24' :
               type === 'warning' ? '#856404' : '#0c5460',
        border: `1px solid ${type === 'success' ? '#c3e6cb' :
                             type === 'error' ? '#f5c6cb' :
                             type === 'warning' ? '#ffeaa7' : '#bee5eb'}`,
        transform: isHiding ? 'translateX(100%)' : 'translateX(0)',
        transition: 'transform 0.3s ease-in-out'
      }}
    >
      {getIcon()}
      <div style={{ flex: 1 }}>{message}</div>
      <button 
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '0',
          color: 'inherit'
        }}
      >
        <i className="bi bi-x"></i>
      </button>
    </div>
  );
};

export default Snackbar;