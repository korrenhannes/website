import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import GoogleOAuthProvider
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginSuccess = (data) => {
    console.log('Logged in user:', data);
    setIsLoggedIn(true);
  };

  const handleSignupSuccess = (data) => {
    console.log('Signed up user:', data);
    // You may want to set isLoggedIn here as well, depending on your signup flow
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  // Your Google client ID
  const googleClientId = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your actual client ID

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <div className="App">
          <NavigationBar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
          
          <Routes>
            <Route path="/" element={<Navigate replace to="/login" />} />
            <Route path="/login" element={
              isLoggedIn ? <Navigate replace to="/cloud-api" /> : <LoginForm onLoginSuccess={handleLoginSuccess} />
            } />
            <Route path="/signup" element={<SignupForm onSignupSuccess={handleSignupSuccess} />} />
            <Route path="/cloud-api" element={<CloudAPIPage />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/explore-further" element={<ExploreFurther />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/free-user" element={<FreeUserPage />} />
            <Route path="/regular-user" element={<RegularUserPage />} />
            <Route path="/premium-user" element={<PremiumUserPage />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
