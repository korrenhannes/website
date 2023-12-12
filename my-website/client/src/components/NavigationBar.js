import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState(0);

  const getRandomDuration = () => {
    const minDays = 3;
    const maxDays = 10;
    return Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  };

  useEffect(() => {
    setTimeLeft(getRandomDuration() * 24 * 60 * 60 * 1000);

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          return getRandomDuration() * 24 * 60 * 60 * 1000;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

const NavigationBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setShowMobileMenu(prev => !prev);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId'); // Removing the user ID

    setIsLoggedIn(false);
    navigate('/cloud-api');

  };

  const navigateToCloudAPI = () => {
    navigate('/cloud-api');
  };

  return (
    <nav className="navigation-bar">
      <div className="nav-logo">
        <button onClick={navigateToCloudAPI} className="logo-button">
          <img src="/Untitled.png" alt="ClipIt Logo" /> {/* Correct the logo path as necessary */}
        </button>
      </div>
      <div className={`nav-links ${showMobileMenu ? 'active' : ''}`}>
        {/* These links will be shown/hidden when the hamburger icon is clicked */}
        <Link to="/offers">Products</Link>
        { !showMobileMenu && <Countdown /> } {/* This line adds the conditional rendering */}
        <Link to="/how-it-works">Why us</Link>
        <a href="/safety">Partner with us</a>
        <a href="/support">Support</a>
      </div>
      <div className="nav-actions">
        {!isLoggedIn && <a href="/login" className="nav-login">Log in</a>}
        {!isLoggedIn ? <Link to="/signup" className="nav-signup">Join us!</Link>
          : <button onClick={handleLogout} className="nav-signup">Logout</button>}
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
