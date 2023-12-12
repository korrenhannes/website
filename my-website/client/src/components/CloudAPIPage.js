import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import '../styles/FullScreen.css';
import '../styles/NavigationBar.css';
import { jwtDecode } from 'jwt-decode';
import Fingerprint2 from 'fingerprintjs2';



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
    const getUniqueComputerId = async () => {
      // Check if the unique identifier is already stored in local storage
      let uniqueId = localStorage.getItem('uniqueComputerId');
    
      if (!uniqueId) {
        // Generate a browser fingerprint
        const components = await Fingerprint2.getPromise();
        const values = components.map((component) => component.value);
        uniqueId = Fingerprint2.x64hash128(values.join(''), 31);
    
        // Store the unique identifier in local storage
        localStorage.setItem('uniqueComputerId', uniqueId);
        if (!localStorage.getItem('guestToken')){
          localStorage.setItem('guestToken', 1)
        }
        console.log('comp id:', localStorage.getItem('uniqueComputerId'), 'guest token:', localStorage.getItem('guestToken'));
      }
    
      return uniqueId;
    };
    
  
   // Retrieve the token from localStorage
   const token = localStorage.getItem('token');
  
   let tokenData = '';
   let userEmail = await getUniqueComputerId();
   let userTokens = localStorage.getItem('guestToken');
   console.log('token', token, 'type:', typeof token);
   // Check if the token is a string and not empty
   if (typeof token === 'string' && token !== '') {
     tokenData = jwtDecode(token);
     userEmail = tokenData.email;
     userTokens = parseInt(tokenData.tokens);
   }
 
    
    console.log('button pressed, details:', userEmail, userTokens);
    if (!userEmail) {
      console.log('User ID not found. Please log in again.');
      setError('User ID not found. Please log in again.');
      setIsLoading(false);
      return;
    }
    if (userTokens <= 0) {
      console.log('no more tokens, need to upgrade subscription');
      setError('no more tokens, need to upgrade subscription');
      setIsLoading(false);
      return;
    }
    const updateTokens = async (email, tokens) => {
      console.log('updating the tokens, email:', email, 'tokens:', tokens);

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update-tokens`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, tokens: tokens }),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const responseData = await response.json();
    
        if (responseData.token) {
          localStorage.setItem('token', responseData.token);
        }
      } catch (error) {
        console.error('Error updating tokens:', error.message);
      }
    };
    
  
    const folderName = 'folder_check'; // Example folder name
    try {
      const response = await axios.post('http://localhost:5000/api/process-youtube-video', {
        link: searchQuery,
        folder_name: folderName,
        userEmail: userEmail  // Include the user ID in the request
      });
      console.log('Video processing started:', response.data);
      console.log('tokens before:', userTokens);
      const updatedTokens = userTokens - 1;
      console.log('tokens after', updatedTokens);
      await updateTokens(userEmail, updatedTokens);
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
        navigate('/free-user');
        break;
      case 'premium':
        navigate('/free-user');
        break;
      default:
        navigate('/free-user');
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
        <h1>creating content has never been easier</h1>
        <h2>just clipIt</h2>
        <div className="search-container">
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