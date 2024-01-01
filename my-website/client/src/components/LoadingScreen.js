import React from 'react';
import '../styles/LoadingScreen.css'; // Import your CSS file for styling

const LoadingScreen = ({ logo }) => {
  return (
    <div className="loading-container">
      <img src={logo} alt="Loading Logo" className="loading-logo"/>
    </div>
  );
}

export default LoadingScreen;
