import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { useSwipeable } from 'react-swipeable';
import UserInfo from './UserInfo';
import NavigationBar from './NavigationBar';
import '../styles/FullScreen.css';
import '../styles/NavigationBar.css';

function CloudAPIPage() {
  const [apiData, setApiData] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPaymentPlan, setUserPaymentPlan] = useState('free'); // Default to 'free'
  const backgroundVideoRef = useRef(null);
  const navigate = useNavigate();

  const PEXELS_API_KEY = 'your_pexels_api_key'; // Replace with your Pexels API key
  const PEXELS_API_URL = 'https://api.pexels.com/videos/popular'; // Pexels popular videos endpoint

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(PEXELS_API_URL, {
        headers: {
          Authorization: PEXELS_API_KEY
        },
        params: {
          per_page: 1 // Fetching only one video for background
        }
      });
      const backgroundVideo = response.data.videos[0].video_files[0].link;
      backgroundVideoRef.current.src = backgroundVideo; // Set the source of the background video
    } catch (err) {
      setError('Error fetching videos from Pexels: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPaymentPlan = async () => {
    try {
      // Assuming the token is stored in localStorage after login
      const token = localStorage.getItem('token');

      // Add a check for token existence
      if (!token) {
        console.log('No token found, defaulting to free plan');
        setUserPaymentPlan('free');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/user/payment-plan', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response && response.data && response.data.paymentPlan) {
        setUserPaymentPlan(response.data.paymentPlan);
      } else {
        console.log('No payment plan info found, defaulting to free plan');
        setUserPaymentPlan('free');
      }
    } catch (error) {
      console.error('Error fetching user payment plan:', error.message);
      setUserPaymentPlan('free'); // Default to free in case of an error
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchUserPaymentPlan();
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentVideoIndex(index => Math.min(index + 1, apiData.length - 1)),
    onSwipedRight: () => setCurrentVideoIndex(index => Math.max(index - 1, 0)),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const handleRedirection = () => {
    // Redirect based on payment plan
    switch(userPaymentPlan) {
      case 'regular':
        navigate('/regular-user');
        break;
      case 'premium':
        navigate('/premium-user');
        break;
      default:
        navigate('/free-user'); // Default or non-registered users
    }
  };

  return (
    <div className="full-screen-container">
      <NavigationBar />
      <video ref={backgroundVideoRef} autoPlay muted loop id="background-video"></video>
      <div className="foreground-content">
        <h1>Swipe Right®</h1>
        <button onClick={handleRedirection}>Go to Your Plan Page</button>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {apiData.length > 0 && (
        <div {...handlers} className="video-container">
          
        </div>
      )}
    </div>
  );
}

export default CloudAPIPage;
