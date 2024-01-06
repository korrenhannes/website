import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import io from 'socket.io-client';
import {
  PayPalScriptProvider
} from "@paypal/react-paypal-js";
import { jwtDecode } from 'jwt-decode';
import { Helmet } from 'react-helmet';


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
import ErrorPage from './components/ErrorPage'; // Import the ErrorPage component
import LoadingScreen from './components/LoadingScreen'; // Import the LoadingScreen component
import chatPic from './chatpic.webp';

import { ComplaintsProvider } from './components/contexts/ComplaintsContext';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [socketIO, setSocketIO] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // New state for loading
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);

  
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
    const loadImage = new Image();
    loadImage.src = chatPic; // URL of your background image
    loadImage.onload = () => setBackgroundImageLoaded(true);
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
    return <LoadingScreen logo={`${process.env.PUBLIC_URL}/logo.WebP`} />;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <PayPalScriptProvider options={{
        "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture"
      }}>
        <Helmet>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>ClipIt - AI-Powered Content Creation for Social Media</title>
          <meta name="description" content="ClipIt revolutionizes social media content creation with advanced AI technology. Effortlessly transform long videos into engaging, viral shorts." />
          <meta name="keywords" content="AI, Content Creation, Social Media, Video Editing, Automated Editing, Content Transformation, Short-form Content" />
          <meta property="og:title" content="ClipIt - AI-Powered Content Creation for Social Media" />
          <meta property="og:description" content="Effortlessly transform long videos into engaging, viral shorts with ClipIt." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.yourwebsite.com" />
          <meta property="og:image" content="https://www.yourwebsite.com/og-image.jpg" />
          <link rel="icon" type="image/png" href="logo.WebP" />
          <link rel="canonical" href="https://www.yourwebsite.com" />
          <script type="application/ld+json">
            {`
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "ClipIt",
                "description": "AI-powered tool for transforming long videos into engaging short clips for social media platforms."
              }
            `}
          </script>
        </Helmet>


        <Router>
          <ComplaintsProvider>
            <div className="App">
              <NavigationBar timeLeft={timeLeft} isLoggedIn={isLoggedIn} onLogoutSuccess={handleLogoutSuccess} />
              <Routes>
                <Route path="/" element={<Navigate replace to={isLoggedIn ? "/home" : "/home"} />} />
                <Route path="/login" element={isLoggedIn ? <Navigate replace to="/home" /> : <LoginForm onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/signup" element={<SignupForm onSignupSuccess={handleSignupSuccess} />} />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/home" element={<CloudAPIPage backgroundImageLoaded={backgroundImageLoaded} />} />
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
                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </div>
          </ComplaintsProvider>
        </Router>
      </PayPalScriptProvider>
    </GoogleOAuthProvider>
  );
}

export default App;