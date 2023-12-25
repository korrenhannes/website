import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/NavigationBar.css';
import { jwtDecode } from 'jwt-decode';
import Fingerprint2 from 'fingerprintjs2';
import styles from '../styles/FullScreen.module.css';
import chatPic from '../chatpic.webp'; // Update the path according to your file structure
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
const nextButton = require('../assets/nextButton.png');




function CloudAPIPage({ enableScrollHandling = true }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPaymentPlan, setUserPaymentPlan] = useState('free');
  const [file, setFile] = useState(null); // State to hold the selected file
  const navigate = useNavigate();
  const touchStartRef = useRef(null);
  // State for video source URL
  const [videoSource, setVideoSource] = useState("https://backend686868k-c9c97cdcbc27.herokuapp.com/stream-video");
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);


  useEffect(() => {
    const loadImage = new Image();
    loadImage.src = chatPic; // URL of your background image
    loadImage.onload = () => setBackgroundImageLoaded(true);
  }, []);
  
   // Ref for the file input
   const fileInputRef = useRef(null);

  // Handle video loading error
  const handleVideoError = () => {
    console.error('Switching to alternative video source');
    setVideoSource("https://backend686868k-c9c97cdcbc27.herokuapp.com/stream-video");
  };
  
   // Function to trigger file input click
   const handleButtonClick = () => {
     fileInputRef.current.click();
   };
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
      // Check if the selected file has a ".mp4" extension
      if (selectedFile.name.endsWith(".mp4")) {
        setFile(selectedFile);
        handleSearchSubmit(null, selectedFile); // Automatically submit after file selection
      } else {
        // Display an error message or handle the case where the file is not an MP4 file
        setError('Only MP4 files are allowed.');
      }
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
    
    let payload;
    if (selectedFile) {
      console.log('selected file');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userEmail', userEmail);
      formData.append('folder_name', 'folder_check');
      payload = formData;
    } else {
      console.log('not selected file');
      payload = {
        link: searchQuery,
        folder_name: 'folder_check',
        userEmail: userEmail
      };
    }
  
    try {
      const config = { headers: {'Content-Type': 'multipart/form-data'} };
      console.log('form data',payload, config);
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
      <div >
        <LazyLoadImage
          alt="background"
          effect="blur"
          src={chatPic} // use your imported image here
          wrapperClassName={styles['background-image']}
        />
      </div>


      <div className={styles['foreground-content']}>
        <h1>Simply ClipIt.</h1>
        <div className={styles['search-container']}>
          <form onSubmit={handleSearchSubmit} className={styles['search-form']}>
            <div className={styles['input-logo-container']}>
              <input
                type="text"
                id={styles['google-like-search']}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter YouTube Url To Try It"
              />
              <img
                src="\magnifying-glass_2015241.png"
                alt="Logo"
                className={styles['search-logo']}
                onClick={handleLogoClick}
              />
            </div>
          </form>
          <div className={styles['or-with-lines']}>OR</div>
           {/* New Container for File Input */}
          <div className={styles['file-input-container']}>
            <input 
              type="file" 
              ref={fileInputRef} // Attach the ref here
              className={styles['file-input']}
              onChange={handleFileChange}
              style={{ display: 'none' }} 
            />
            <button className={styles['upload-file-button']}
             onClick={handleButtonClick} // Use this button to trigger the file input
            >Upload File</button>
          </div>
        </div>
      </div>
    </div>

  );
}

export default CloudAPIPage;