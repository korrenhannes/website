import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import io from 'socket.io-client';
import {
  PayPalScriptProvider
} from "@paypal/react-paypal-js";
import { jwtDecode } from 'jwt-decode';


import NavigationBar from './components/NavigationBar';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ConfirmationWaitPage from './components/ConfirmationWaitPage';
import CloudAPIPage from './components/CloudAPIPage';
import OffersPage from './components/OffersPage';
import FreeUserPage from './components/FreeUserPage';
import RegularUserPage from './components/RegularUserPage';
import PremiumUserPage from './components/PremiumUserPage';
import HowItWorks from './components/HowItWorks';
import ExploreFurther from './components/ExploreFurther';
import SupportPage from './components/SupportPage';
import ForgotPasswordForm from './components/ForgotPassword';
import PartnerWithUsPage from './components/PartnerWithUs';
import AffiliateDashboardPage from './components/AffiliateDashboardPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import ComplaintsPage from './components/ComplaintsPage';
import MyVideosPage from './components/MyVideosPage';
import LoadingScreen from './components/LoadingScreen'; // Import the LoadingScreen component

import { ComplaintsProvider } from './components/contexts/ComplaintsContext';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [socketIO, setSocketIO] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // New state for loading

  
  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001'; // Default to localhost if the variable is not set
    const newSocketIO = io(socketUrl);
    setSocketIO(newSocketIO);
  
    return () => {
      if (newSocketIO) newSocketIO.disconnect();
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (typeof token === 'string' && token !== '') { 
      const tokenData = jwtDecode(token);
      const userEmail = tokenData.email;
      if (userEmail.includes('@')){
        setIsLoggedIn(!!token);
      }
    } else {
      setIsLoggedIn(!!token);
    }
  }, []);

  useEffect(() => {
    // Simulate a loading process, replace with actual loading logic
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3000 ms for example

    return () => clearTimeout(timer);
  }, []);

  const [complaints, setComplaints] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleLoginSuccess = (data) => {
    localStorage.setItem('token', data.token);
    setIsLoggedIn(true);
  };

  const handleSignupSuccess = (data) => {
    Navigate('/confirmation-wait');
  };

  const handleLogoutSuccess = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    if (socketIO) socketIO.disconnect();
  };

  const googleClientId = 'YOUR_GOOGLE_CLIENT_ID';

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

  const getRandomDuration = () => {
    const minDays = 3;
    const maxDays = 10;
    return Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  };

  
  if (isLoading) {
    return <LoadingScreen logo={`${process.env.PUBLIC_URL}/logo.png`} />;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <PayPalScriptProvider options={{
        "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture"
      }}>
        <Router>
          <ComplaintsProvider>
            <div className="App">
              <NavigationBar timeLeft={timeLeft} isLoggedIn={isLoggedIn} onLogoutSuccess={handleLogoutSuccess} />
              <Routes>
                <Route path="/" element={<Navigate replace to={isLoggedIn ? "/cloud-api" : "/cloud-api"} />} />
                <Route path="/login" element={isLoggedIn ? <Navigate replace to="/cloud-api" /> : <LoginForm onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/signup" element={<SignupForm onSignupSuccess={handleSignupSuccess} />} />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/cloud-api" element={<CloudAPIPage />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/explore-further" element={<ExploreFurther />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/complaints" element={<ComplaintsPage />} />
                <Route path="/offers" element={<OffersPage isLoggedIn={isLoggedIn} />} />
                <Route path="/free-user" element={<FreeUserPage />} />
                <Route path="/my-videos" element={<MyVideosPage />} />
                <Route path="/regular-user" element={<RegularUserPage />} />
                <Route path="/premium-user" element={<PremiumUserPage />} />
                <Route path="/confirmation-wait" element={<ConfirmationWaitPage />} />
                <Route path="/partner" element={<PartnerWithUsPage />} />
                <Route path="/affiliate-dashboard" element={<AffiliateDashboardPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              </Routes>
            </div>
          </ComplaintsProvider>
        </Router>
      </PayPalScriptProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
