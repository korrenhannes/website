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

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const navigateToCloudAPI = () => {
    navigate('/cloud-api');
  };

  return (
    <nav className="navigation-bar">
      <div className="nav-logo">
        <button onClick={navigateToCloudAPI} className="logo-button">
          <img src="/WhatsApp Image 2023-12-01 at 01.53.28.jpeg" alt="Logo" />
        </button>
      </div>
      <div className="nav-links">
        <a href="/products">Products <Countdown /></a>
        <a href="/HowItWorks" className="how-it-works">Why us</a>
        <a href="/safety" className="hide-on-small">Safety</a>
        <a href="/support">Support</a>
      </div>
      <div className="nav-actions">
        {!isLoggedIn && <a href="/login" className="nav-login">Log in</a>}
        {!isLoggedIn
          ? <Link to="/signup" className="nav-signup no-underline">Join us!</Link>
          : <button onClick={handleLogout} className="nav-signup no-underline">Logout</button>}
      </div>
    </nav>
  );
};

export default NavigationBar;
