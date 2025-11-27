import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({
  size = 'medium',
  variant = 'spinner',
  color = 'primary',
  overlay = false
}) => {
  const spinnerClass = `loading-spinner-container ${size} ${variant} ${color} ${overlay ? 'overlay' : ''}`;

  return (
    <div className={spinnerClass}>
      <div className="loading-spinner">
        {variant === 'spinner' && <div className="spinner"></div>}
        {variant === 'dots' && (
          <div className="dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
        {variant === 'pulse' && <div className="pulse"></div>}
        {variant === 'bars' && (
          <div className="bars">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        )}
        {variant === 'ring' && <div className="ring"></div>}
      </div>
    </div>
  );
};

export default LoadingSpinner;