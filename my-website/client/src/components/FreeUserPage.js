import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserInfo from './UserInfo';
import NavigationBar from './NavigationBar';
import '../styles/FullScreen.css';
import '../styles/NavigationBar.css';

function CloudAPIPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPaymentPlan, setUserPaymentPlan] = useState('free');
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const backgroundVideoRef = useRef(null);
  const navigate = useNavigate();

  const PEXELS_API_KEY = 'your_pexels_api_key'; // Replace with your Pexels API key
  const PEXELS_API_URL = 'https://api.pexels.com/videos/popular';

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const randomPage = Math.floor(Math.random() * 10) + 1;
      const response = await axios.get(PEXELS_API_URL, {
        headers: {
          Authorization: PEXELS_API_KEY
        },
        params: {
          per_page: 3, // Fetch 3 videos instead of 2
          page: randomPage
        }
      });

      setVideos(response.data.videos.map(video => video.video_files[0].link));
      setCurrentVideoIndex(0); // Reset to the first video
      backgroundVideoRef.current.src = response.data.videos[0].video_files[0].link;
    } catch (err) {
      setError('Error fetching videos from Pexels: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPaymentPlan = async () => {
    try {
      const token = localStorage.getItem('token');
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
      setUserPaymentPlan('free');
    }
  };


  useEffect(() => {
    fetchVideos();
    fetchUserPaymentPlan();

    // Double click event listener for fetching new video
    const handleDoubleClick = () => {
      const nextVideoIndex = (currentVideoIndex + 1) % videos.length;
      setCurrentVideoIndex(nextVideoIndex);
      if (videos[nextVideoIndex]) {
        backgroundVideoRef.current.src = videos[nextVideoIndex];
      }
    };

    window.addEventListener('dblclick', handleDoubleClick);

    return () => {
      window.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [currentVideoIndex, videos]);

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
        {/* Removed <h1> and <button> elements */}
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default CloudAPIPage;