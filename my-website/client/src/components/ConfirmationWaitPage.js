import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api'; // Ensure this is the correct import for your API calls
import styles from '../styles/FullScreen.module.css'; // Import the appropriate CSS

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
          navigate('/login'); // Navigate to the dashboard or home page
        }
      } catch (error) {
        console.error("Error checking confirmation:", error);
      }
    }, 5000);

    return () => clearInterval(interval); // Clean up
  }, [navigate]);

  return (
    <div className={styles['full-screen-container']}>
      <div
        className={styles['background-image']}
        style={{ backgroundImage: 'url("/waitinga.webp")' }} // Replace with your image path
      ></div>
      <div className={styles['foreground-content2']}>
        <h1>Welcome to ClipIt!</h1>
        <p>Thank you for signing up. We're currently confirming your email address.</p>
        <p>Please check your inbox for a confirmation link to activate your ClipIt account.</p>
        {isConfirmed && <p>Great! Your email is confirmed. Taking you to ClipIt's world of content creation...</p>}
      </div>
    </div>
  );
}

export default ConfirmationWaitPage;
