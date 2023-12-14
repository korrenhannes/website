import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Countdown = ({ timeLeft }) => {
  if (typeof timeLeft !== "number" || isNaN(timeLeft)) {
    return <span className="countdown">Loading...</span>;
  }
  const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
  const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

  return (
    <span className="countdown">
      {`${days}d ${hours}h ${minutes}m ${seconds}s`}
    </span>
  );
};

const NavigationBar = ({ timeLeft, isLoggedIn, onLogoutSuccess }) => {
  //const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  //const [timeLeft, setTimeLeft] = useState(0);
  // const getRandomDuration = () => {
  //   const minDays = 3;
  //   const maxDays = 10;
  //   return Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  // };

  // useEffect(() => {
  //   setTimeLeft(getRandomDuration() * 24 * 60 * 60 * 1000);

  //   const interval = setInterval(() => {
  //     setTimeLeft((prevTime) => {
  //       if (prevTime <= 1000) {
  //         return getRandomDuration() * 24 * 60 * 60 * 1000;
  //       }
  //       return prevTime - 1000;
  //     });
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setShowMobileMenu(prev => !prev);
  };

  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   setIsLoggedIn(!!token);
  // }, []);

  const handleLogout = () => {
    onLogoutSuccess();
    navigate('/login');
  };

  const navigateToCloudAPI = () => {
    navigate('/cloud-api');
  };
  const renderAuthLinks = () => {
    return isLoggedIn
      ? <button onClick={handleLogout} className="nav-signup">Logout</button>
      : (
        <>
          <Link to="/login" className="nav-login">Log in</Link>
          <Link to="/signup" className="nav-signup">Join us!</Link>
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
        <button onClick={navigateToCloudAPI} className="logo-button">
          <img src="/Untitled.png" alt="ClipIt Logo" />
        </button>
      </div>
      {isMobile && (
        <div className="countdown-mobile">
          <Link className='deals-link' to="/offers" style={{ textDecoration: 'none' }}>limited deals</Link>
          <Countdown timeLeft={timeLeft} />
        </div>
      )} 
      <div className={`nav-links ${showMobileMenu ? 'active' : ''}`}>
        {!isMobile && <Link to="/offers" onClick={handleLinkClick}>limited deals</Link>}
        {!isMobile && <Countdown timeLeft={timeLeft} />} 
        <Link to="/how-it-works" onClick={handleLinkClick}>Why us</Link>
        <Link to="/partner" onClick={handleLinkClick}>Partner with us</Link>
        <Link to="/support" onClick={handleLinkClick}>Support</Link>
        {isMobile && renderAuthLinks()}
      </div>
      <div className="nav-actions">
        {!isMobile && renderAuthLinks()}
        <button className="hamburger" onClick={toggleMobileMenu}>
          <div></div>
          <div></div>
          <div></div>
        </button>
      </div>
    </nav>
  );
};

export default NavigationBar;
