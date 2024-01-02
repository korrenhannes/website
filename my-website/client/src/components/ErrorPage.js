import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ErrorPage.css'; // Import your CSS file for styling

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/cloud-api');
  };

  return (
    <div className="error-container">
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you are looking for does not exist. It might have been moved or deleted.</p>
      <button onClick={handleGoBack} className="go-back-btn">
        Go Back to Home
      </button>
    </div>
  );
}

export default ErrorPage;
