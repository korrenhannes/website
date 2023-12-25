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
import ConfirmationWaitPage from './components/ConfirmationWaitPage'; // Added import for ConfirmationWaitPage
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
import ResetPasswordPage from './components/ResetPasswordPage'; // Import ResetPasswordPage
import ComplaintsPage from './components/ComplaintsPage';
import { ComplaintsProvider } from './components/contexts/ComplaintsContext';
import MyVideosPage from './components/MyVideosPage';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [socketIO, setSocketIO] = useState(null);
  const [webSocket, setWebSocket] = useState(null);

  useEffect(() => {
    // Establish Socket.IO connection
    const newSocketIO = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001');
    setSocketIO(newSocketIO);

    return () => {
      // Disconnect Socket.IO when the app unmounts
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
    }else{
      setIsLoggedIn(!!token);
    }
    
  }, []);

  useEffect(() => {
    function connectWebSocket() {
      const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || 'wss://localhost:5000/websocket';
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to WebSocket');
        setWebSocket(ws); // Set the WebSocket in state when connected
      };

      ws.onmessage = (event) => {
        console.log('Received:', event.data);
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      ws.onclose = (e) => {
        console.log('WebSocket Disconnected. Attempting to reconnect...', e.reason);
        setWebSocket(null); // Clear the WebSocket in state when disconnected

        if (!e.wasClean) {
          setTimeout(() => {
            console.log('Reconnecting WebSocket...');
            connectWebSocket();
          }, 3000);
        }
      };

      return ws;
    }

    const ws = connectWebSocket();

    return () => {
      if (ws) ws.close(); // Clean up WebSocket connection when component unmounts
    };
  }, []);

  const [complaints, setComplaints] = useState([]);

  const handleLoginSuccess = (data) => {
    console.log('Logged in user:', data);
    localStorage.setItem('token', data.token); // Assuming the token is in the data response
    setIsLoggedIn(true);
  };

  const handleSignupSuccess = (data) => {
    console.log('Signed up user:', data);
    Navigate('/confirmation-wait'); // Redirect to confirmation-wait page
  };

  const handleLogoutSuccess = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    if (socketIO) socketIO.disconnect();
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
          <ComplaintsProvider> {/* Wrap ComplaintsProvider around all components that need access to the complaints context */}
            <div className="App">
              <NavigationBar timeLeft={timeLeft} isLoggedIn={isLoggedIn} onLogoutSuccess={handleLogoutSuccess} />
              <Routes>
                <Route path="/" element={<Navigate replace to={isLoggedIn ? "/cloud-api" : "/login"} />} />
                <Route path="/login" element={isLoggedIn ? <Navigate replace to="/cloud-api" /> : <LoginForm onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/signup" element={<SignupForm onSignupSuccess={handleSignupSuccess} />} />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/cloud-api" element={<CloudAPIPage />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/explore-further" element={<ExploreFurther />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/complaints" element={<ComplaintsPage />} />
                <Route path="/offers" element={<OffersPage />} />
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