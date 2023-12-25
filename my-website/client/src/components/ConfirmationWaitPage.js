import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api'; // Make sure this is the correct import for your API calls
import styles from '../styles/FullScreen.module.css'; // Import the same CSS

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
    <div className={styles['full-screen-container']}>
      <video
        autoPlay
        loop
        muted
        id="background-video"
        className={styles['background-video']}
      >
        <source src="\Simply ClipIt..mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className={styles['foreground-content']}>
        <h1>Waiting for Email Confirmation</h1>
        <p>Please check your email and click on the confirmation link.</p>
        {isConfirmed && <p>Your email has been confirmed! Redirecting...</p>}
      </div>
    </div>
  );
}

export default ConfirmationWaitPage;