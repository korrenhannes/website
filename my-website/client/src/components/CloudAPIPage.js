import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import '../styles/NavigationBar.css';
import { jwtDecode } from 'jwt-decode';
import Fingerprint2 from 'fingerprintjs2';
import styles from '../styles/FullScreen.module.css';




function CloudAPIPage({ enableScrollHandling = true }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPaymentPlan, setUserPaymentPlan] = useState('free');
  const navigate = useNavigate();
  const touchStartRef = useRef(null);

  useEffect(() => {
    if (!enableScrollHandling) {
      return;
    }
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

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [navigate]);

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
    console.log('token not empty');
     tokenData = jwtDecode(token);
     console.log('token data:', tokenData);
     userEmail = tokenData.email;
     userTokens = parseInt(tokenData.tokens);
     console.log('user email:', userEmail, 'user tokens:', userTokens);
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
    <div className={styles['full-screen-container']}>
      {/* Background Video */}
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
        <h1>creating content has never been easier</h1>
        <h2>just clipIt</h2>
        <div className={styles['search-container']}>
          <form onSubmit={handleSearchSubmit} className={styles['search-form']}>
            <div className={styles['input-logo-container']}>
              <input
                type="text"
                id={styles['google-like-search']}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search query"
              />
              <img
                src="\magnifying-glass_2015241.png"
                alt="Logo"
                className={styles['search-logo']}
                onClick={handleLogoClick}
              />
            </div>
          </form>
          <p className={styles['try-it-text']}>enter URL to try it</p>
        </div>
      </div>
    </div>

  );
}

export default CloudAPIPage;