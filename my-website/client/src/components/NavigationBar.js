import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MESSAGES } from '../messages/messages'; // Import the language file
import checkUploadStatus from './CheckUploadStatus';
import checkLoadingProcess from './CheckLoading';

const getRandomFutureDate = () => {
  const twoWeeksInMs = 2 * 7 * 24 * 60 * 60 * 1000;
  const fourWeeksInMs = 4 * 7 * 24 * 60 * 60 * 1000;
  const randomTime = Math.random() * (fourWeeksInMs - twoWeeksInMs) + twoWeeksInMs;
  return new Date(Date.now() + randomTime);
};

const Countdown = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const now = new Date();
    const difference = targetDate - now;
    return difference > 0 ? difference : 0;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, targetDate]);

  if (isNaN(timeLeft)) {
    return <span className="countdown">Loading...</span>;
  }

  const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
  const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

  return (
    <span className="countdown">
      {timeLeft > 0 ? `${days}d ${hours}h ${minutes}m ${seconds}s- ` : "Time's up!"}
    </span>
  );
};


const NavigationBar = ({ isLoggedIn, onLogoutSuccess }) => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mainLoaderETA, setMainLoaderETA] = useState('');

  const calculateMainLoaderETA = (progress) => {
    const totalTime = 60; // Total time for main loader in minutes
    const remainingTime = totalTime - (progress / 100) * totalTime;
    return `ETA to video: ${Math.ceil(remainingTime)} minutes`;
  };
  
  useEffect(() => {
    let etaInterval;

    const updateETA = async () => {
      if (isLoggedIn) {
        const uploadComplete = await checkUploadStatus(/* user's email or ID */);
        if (!uploadComplete) {
          const progress = await checkLoadingProcess(/* user's email or ID */);
          const eta = calculateMainLoaderETA(progress);
          setMainLoaderETA(eta);
        } else {
          setMainLoaderETA(''); // Clear ETA if the upload is complete
        }
      }
    };

    if (isLoggedIn) {
      updateETA(); // Initial check
      etaInterval = setInterval(updateETA, 1000); // Update every 5 minutes
    }

    return () => clearInterval(etaInterval);
  }, [isLoggedIn]);

  const initializeTargetDate = () => {
    const savedDate = localStorage.getItem('targetDate');
    if (savedDate && new Date(savedDate) > new Date()) {
      return new Date(savedDate);
    } else {
      const newDate = getRandomFutureDate();
      localStorage.setItem('targetDate', newDate);
      return newDate;
    }
  };

  const [targetDate, setTargetDate] = useState(initializeTargetDate());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkDate = setInterval(() => {
      if (new Date() > targetDate) {
        const newDate = getRandomFutureDate();
        localStorage.setItem('targetDate', newDate);
        setTargetDate(newDate);
      }
    }, 1000);

    return () => clearInterval(checkDate);
  }, [targetDate]);

  const toggleMobileMenu = () => {
    setShowMobileMenu(prev => !prev);
  };

  const handleLogout = () => {
    onLogoutSuccess();
    if (isMobile) {
      setShowMobileMenu(false);
    }
    navigate('/login');
  };

  const navigateToCloudAPI = () => {
    navigate('/home');
  };

  const renderAuthLinks = () => {
    return isLoggedIn
      ? <Link to="/login" onClick={handleLogout} className="nav-signup">Logout</Link>
      : (
        <>
          <Link to="/login" onClick={handleLinkClick} className="nav-login">Log in</Link>
          <Link to="/signup" onClick={handleLinkClick} className="nav-signup">Join us!</Link>
        </>
      );
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  return (
    <nav className="navigation-bar">
      <div className="nav-logo">
        <button onClick={navigateToCloudAPI} className="logo-button" aria-label="Go to Cloud API">
          <img src="/log.WebP" alt="ClipIt Logo" />
        </button>
      </div>
      {isMobile && (
        <div className="countdown-mobile">
          <Link className='deals-link' to="/offers" style={{ textDecoration: 'none' }}>
            <span className="deal-countdown-wrapper">
              <Countdown targetDate={targetDate} />
              {MESSAGES.limitedDeals}
            </span>
          </Link>
        </div>
      )}
     
      <div className={`nav-links ${showMobileMenu ? 'active' : ''}`}>
       
        <Link to="/offers" onClick={handleLinkClick} className="deal-countdown-wrapper">
        {!isMobile && ( <Countdown targetDate={targetDate}/>)}
          {MESSAGES.limitedDealsMob}
        </Link>
        <Link to="/how-it-works" onClick={handleLinkClick}>{MESSAGES.whyUs}</Link>
        <Link to="/clip-it-shorts" onClick={handleLinkClick}>{MESSAGES.blog}</Link>
        {isLoggedIn&&<Link to="/my-videos" onClick={handleLinkClick}>{MESSAGES.myVideos}</Link>}
        {isLoggedIn && mainLoaderETA && (
          <Link to="/free-user" onClick={handleLinkClick}>{mainLoaderETA}</Link>
      )}
        {isMobile && renderAuthLinks()}
      </div>
      <div className="nav-actions">
        {!isMobile && renderAuthLinks()}
        <button 
          className={`hamburger ${showMobileMenu ? 'open' : ''}`} 
          onClick={toggleMobileMenu} 
          aria-label={showMobileMenu ? "Close menu" : "Open menu"}>
          <div></div>
          <div></div>
          <div></div>
        </button>
      </div>
    </nav>
  );
};

export default NavigationBar;