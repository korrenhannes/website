import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/NavigationBar.css';
import { jwtDecode } from 'jwt-decode';
import Fingerprint2 from 'fingerprintjs2';
import styles from '../styles/FullScreen.module.css';




function CloudAPIPage({ enableScrollHandling = true }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPaymentPlan, setUserPaymentPlan] = useState('free');
  const [file, setFile] = useState(null); // State to hold the selected file
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleSearchSubmit(null, selectedFile); // Automatically submit after file selection
    }
  };
  
  const handleSearchSubmit = async (e, selectedFile = null) => {
    if (e) e.preventDefault();
    setIsLoading(true);
  
    // Function to get unique computer id
    const getUniqueComputerId = async () => {
      let uniqueId = localStorage.getItem('uniqueComputerId');
      if (!uniqueId) {
        const components = await Fingerprint2.getPromise();
        const values = components.map(component => component.value);
        uniqueId = Fingerprint2.x64hash128(values.join(''), 31);
        localStorage.setItem('uniqueComputerId', uniqueId);
        if (!localStorage.getItem('guestToken')) {
          localStorage.setItem('guestToken', 1);
        }
      }
      return uniqueId;
    };
  
    // Function to update tokens
    const updateTokens = async (email, tokens) => {
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
        setError('Error updating tokens');
      }
    };
  
    // Function to handle redirection
    const handleRedirection = () => {
      switch (userPaymentPlan) {
        case 'regular':
          navigate('/free-user');
          break;
        case 'premium':
          navigate('/premium-user');
          break;
        default:
          navigate('/free-user');
      }
    };
  
    let userEmail = await getUniqueComputerId();
    let userTokens = parseInt(localStorage.getItem('guestToken') || '0');
  
    if (!userEmail) {
      setError('User ID not found. Please log in again.');
      setIsLoading(false);
      return;
    }
    if (userTokens <= 0) {
      setError('No more tokens, need to upgrade subscription');
      setIsLoading(false);
      return;
    }
  
    let payload;
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userEmail', userEmail);
      formData.append('folder_name', 'folder_check');
      payload = formData;
    } else {
      payload = {
        link: searchQuery,
        folder_name: 'folder_check',
        userEmail: userEmail
      };
    }
  
    try {
      const config = selectedFile ? { headers: {'Content-Type': 'multipart/form-data'} } : {};
      const response = await axios.post('http://localhost:5000/api/process-youtube-video', payload, config);
      console.log('Video processing started:', response.data);
      userTokens = userTokens - 1;
      await updateTokens(userEmail, userTokens);
      handleRedirection();
    } catch (error) {
      console.error('Error processing your request:', error.message);
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
        <h1>Creating Content Has Never Been Easier</h1>
        <h2>Simply ClipIt</h2>
        <div className={styles['search-container']}>
          <form onSubmit={handleSearchSubmit} className={styles['search-form']}>
            <div className={styles['input-logo-container']}>
              <input
                type="text"
                id={styles['google-like-search']}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Url To Try It"
              />
              <input 
                type="file" 
                onChange={handleFileChange}
              />
              <img
                src="\magnifying-glass_2015241.png"
                alt="Logo"
                className={styles['search-logo']}
                onClick={handleLogoClick}
              />
            </div>
          </form>
        </div>
      </div>
    </div>

  );
}

export default CloudAPIPage;