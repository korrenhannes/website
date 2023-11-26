import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

const NavigationBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate(); // Create navigate function

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

  const navigateToCloudAPI = () => {
    navigate('/cloud-api'); // Function to navigate to CloudAPIPage
  };

  return (
    <nav className="navigation-bar">
      <div className="nav-logo">
        <button onClick={navigateToCloudAPI} className="logo-button">
          {/* Insert your logo image or text here */}
          <img src="/path-to-your-logo.png" alt="Logo" />
        </button>
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
