import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({
  size = 'medium',
  color = 'primary',
  overlay = false
}) => {
  const spinnerClass = `loading-spinner-container ${size} ${color} ${overlay ? 'overlay' : ''}`;

  return (
    <div className={spinnerClass}>
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;