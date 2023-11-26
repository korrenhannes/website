import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NavigationBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for token in local storage to determine login status
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Sets isLoggedIn to true if token exists
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token from local storage
    setIsLoggedIn(false); // Update isLoggedIn state
    // Redirect to login page or perform other actions as needed
  };

  return (
    <nav className="navigation-bar">
      <div className="nav-logo">
        {/* Logo and potentially a mobile menu toggle could go here */}
      </div>
      <div className="nav-links">
        <a href="/products">Products</a>
        <a href="/learn" className="hide-on-small">Learn</a>
        <a href="/safety" className="hide-on-small">Safety</a>
        <a href="/support">Support</a>
      </div>
      <div className="nav-actions">
        {!isLoggedIn && <a href="/login" className="nav-login">Log in</a>}
        {!isLoggedIn
          ? <Link to="/signup" className="nav-signup no-underline">Join us</Link>
          : <button onClick={handleLogout} className="nav-signup no-underline">Logout</button>}
      </div>
    </nav>
  );
};

export default NavigationBar;
