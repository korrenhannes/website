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
import ForgotPasswordForm from './components/ForgotPassword';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Establish Socket.IO connection
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001' );
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

  const handleLogoutSuccess = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    if (socket) socket.disconnect();
    console.log('logging out');
  };

  const googleClientId = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your actual client ID
  const [timeLeft, setTimeLeft] = useState(0);

  // Timer logic
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

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <PayPalScriptProvider options={{
      "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
      currency: "USD",
      intent: "capture"
    }}>
      <Router>
        <div className="App">
          <NavigationBar timeLeft={timeLeft} isLoggedIn={isLoggedIn} onLogoutSuccess={handleLogoutSuccess} /> {/* Pass timeLeft to NavigationBar */}
          <Routes>
            <Route path="/" element={<Navigate replace to={isLoggedIn ? "/cloud-api" : "/login"} />} />
            <Route path="/login" element={isLoggedIn ? <Navigate replace to="/cloud-api" /> : <LoginForm onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/signup" element={<SignupForm onSignupSuccess={handleSignupSuccess} />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
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
