import React, { useState, useEffect } from 'react';
import './Alert.css';

const Alert = ({ type = 'info', message, onClose, autoClose = 5000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose && autoClose > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) setTimeout(onClose, 300);
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) setTimeout(onClose, 300);
  };

  if (!message) return null;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className={`alert alert-${type} ${visible ? 'alert-visible' : 'alert-hidden'}`}>
      <span className="alert-icon">{icons[type]}</span>
      <span className="alert-message">{message}</span>
      <button className="alert-close" onClick={handleClose} aria-label="Close">
        ×
      </button>
    </div>
  );
};

export default Alert;
