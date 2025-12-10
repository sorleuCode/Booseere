import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({
  size = 'medium',
  color = 'primary',
  overlay = false,
  className = ''
}) => {
  const spinnerClass = `loading-spinner-container ${size} ${color} ${overlay ? 'overlay' : ''} ${className}`;

  return (
    <div className={spinnerClass}>
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;