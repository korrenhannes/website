import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import io from 'socket.io-client';
import {
  PayPalScriptProvider
} from "@paypal/react-paypal-js";

import NavigationBar from './components/NavigationBar';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import CloudAPIPage from './components/CloudAPIPage';
import OffersPage from './components/OffersPage';
import FreeUserPage from './components/FreeUserPage';
import RegularUserPage from './components/RegularUserPage';
import PremiumUserPage from './components/PremiumUserPage';
import HowItWorks from './components/HowItWorks';
import ExploreFurther from './components/ExploreFurther';
import SupportPage from './components/SupportPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Establish Socket.IO connection
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    return () => {
      // Disconnect Socket.IO when the app unmounts
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginSuccess = (data) => {
    console.log('Logged in user:', data);
    localStorage.setItem('token', data.token); // Assuming the token is in the data response
    setIsLoggedIn(true);
  };

  const handleSignupSuccess = (data) => {
    console.log('Signed up user:', data);
    // Handle signup success (similar to login, if applicable)
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // Disconnect Socket.IO when the user logs out
    if (socket) socket.disconnect();
  };

  const googleClientId = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your actual client ID

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <PayPalScriptProvider options={{
      "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
      currency: "ILS",
      intent: "capture"
    }}>
      <Router>
        <div className="App">
          <NavigationBar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Navigate replace to={isLoggedIn ? "/cloud-api" : "/login"} />} />
            <Route path="/login" element={isLoggedIn ? <Navigate replace to="/cloud-api" /> : <LoginForm onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/signup" element={<SignupForm onSignupSuccess={handleSignupSuccess} />} />
            <Route path="/cloud-api" element={<CloudAPIPage />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/explore-further" element={<ExploreFurther />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/free-user" element={<FreeUserPage />} />
            <Route path="/regular-user" element={<RegularUserPage />} />
            <Route path="/premium-user" element={<PremiumUserPage />} />
          </Routes>
        </div>
      </Router>
      </PayPalScriptProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
