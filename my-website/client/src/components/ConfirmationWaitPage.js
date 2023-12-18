import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api'; // Make sure this is the correct import for your API calls

function ConfirmationWaitPage() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail'); // Retrieve email from local storage
    if (!userEmail) {
      navigate('/signup'); // Redirect to signup if email is not found
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await api.checkConfirmation(userEmail);
        if (response.data.isConfirmed) {
          setIsConfirmed(true);
          clearInterval(interval); // Stop checking once confirmed
          navigate('/login');
        }
      } catch (error) {
        console.error("Error checking confirmation:", error);
      }
    }, 5000);

    return () => clearInterval(interval); // Clean up
  }, [navigate]);

  return (
    <div className="confirmation-wait-page">
      <h2>Waiting for Email Confirmation</h2>
      <p>Please check your email and click on the confirmation link.</p>
      {isConfirmed && <p>Your email has been confirmed! Redirecting...</p>}
    </div>
  );
}

export default ConfirmationWaitPage;
