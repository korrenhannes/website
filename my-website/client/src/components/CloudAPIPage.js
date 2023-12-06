import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import '../styles/FullScreen.css';
import '../styles/NavigationBar.css';


function CloudAPIPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPaymentPlan, setUserPaymentPlan] = useState('free');
  const backgroundVideoRef = useRef(null);
  const navigate = useNavigate();
  const touchStartRef = useRef(null);

  const PEXELS_API_KEY = 'hKTWEteFrhWt6vY5ItuDO4ZUwVx2jvnfr0wtDgeqhIyedZyDXVDutynu';
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
          per_page: 2,
          page: randomPage
        }
      });
      const backgroundVideo = response.data.videos[0].video_files[0].link;
      backgroundVideoRef.current.src = backgroundVideo;
    } catch (err) {
      setError('Error fetching videos from Pexels: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPaymentPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail'); // Retrieve userEmail from localStorage
      if (!token || !userEmail) {
        console.log('No token or user email found, defaulting to free plan');
        setUserPaymentPlan('free');
        return;
      }
  
      const response = await axios.get(`http://localhost:3000/api/auth/user/payment-plan?email=${userEmail}`, {
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

    const handleDoubleClick = () => {
      fetchVideos();
    };

    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!touchStartRef.current) {
        return;
      }

      const touchEndY = e.touches[0].clientY;
      if (touchStartRef.current > touchEndY + 50) {
        navigate('/explore-further');
      }
    };

    const handleWheel = (e) => {
      if (e.deltaY > 100) {
        navigate('/explore-further');
      }
    };

    window.addEventListener('dblclick', handleDoubleClick);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('dblclick', handleDoubleClick);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
  
    // Retrieve user ID from localStorage or another secure method
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User ID not found. Please log in again.');
      setIsLoading(false);
      return;
    }
  
    const folderName = 'folder_check'; // Example folder name
    try {
      const response = await axios.post('http://localhost:5000/api/process-youtube-video', {
        link: searchQuery,
        folder_name: folderName,
        user_id: userId  // Include the user ID in the request
      });
      console.log('Video processing started:', response.data);
      handleRedirection();
    } catch (error) {
      console.error('Error submitting search:', error.message);
      setError('Error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const handleRedirection = () => {
    switch(userPaymentPlan) {
      case 'regular':
        navigate('/regular-user');
        break;
      case 'premium':
        navigate('/premium-user');
        break;
      default:
        navigate('/cloud-api');
    }
  };

  const handleLogoClick = () => {
    handleSearchSubmit();
  };

  return (
    <div className="full-screen-container">
      <NavigationBar />
      <video ref={backgroundVideoRef} autoPlay muted loop id="background-video"></video>
      <div className="foreground-content">
        <h1>creating content has never been easier Just Clip It</h1>
        <div className="search-bar-container">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="input-logo-container">
              <input
                type="text"
                id="google-like-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search query"
              />
              <img
                src="\magnifying-glass_2015241.png"
                alt="Logo"
                className="search-logo"
                onClick={handleLogoClick}
              />
            </div>
          </form>
        </div>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
      </div>
    </div>
  );
}

export default CloudAPIPage;
