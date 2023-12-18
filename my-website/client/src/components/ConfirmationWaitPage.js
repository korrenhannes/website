import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api'; // Make sure this is the correct import for your API calls

function ConfirmationWaitPage() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Define interval in the broader scope
    const interval = setInterval(() => {
      checkConfirmation(interval);
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  const checkConfirmation = async (interval) => {
    try {
      const response = await api.get('/auth/check-confirmation'); // Adjust the endpoint as necessary
      if (response.data.isConfirmed) {
        setIsConfirmed(true);
        clearInterval(interval); // Stop checking once confirmed
        navigate('/offers');
      }
    } catch (error) {
      console.error("Error checking confirmation:", error);
    }
  };

  return (
    <div className="confirmation-wait-page">
      <h2>Waiting for Email Confirmation</h2>
      <p>Please check your email and click on the confirmation link.</p>
      {isConfirmed && <p>Your email has been confirmed! Redirecting...</p>}
    </div>
  );
}

export default ConfirmationWaitPage;
