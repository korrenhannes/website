import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import CloudAPIPage from './components/CloudAPIPage';
import OffersPage from './components/OffersPage';
import PaymentPage from './components/PaymentPage';
import FreeUserPage from './components/FreeUserPage';
import RegularUserPage from './components/RegularUserPage';
import PremiumUserPage from './components/PremiumUserPage';
import HowItWorks from './components/HowItWorks'; // Import the HowItWorks component



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = (data) => {
    console.log('Logged in user:', data);
    setIsLoggedIn(true);
  };

  const handleSignupSuccess = (data) => {
    console.log('Signed up user:', data);
    // Implement any signup success logic if needed
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={
            isLoggedIn ? <Navigate replace to="/cloud-api" /> : <LoginForm onLoginSuccess={handleLoginSuccess} />
          } />
          <Route path="/signup" element={<SignupForm onSignupSuccess={handleSignupSuccess} />} />
          <Route path="/cloud-api" element={<CloudAPIPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} /> {/* New route for How It Works */}
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/free-user" element={<FreeUserPage />} />
          <Route path="/regular-user" element={<RegularUserPage />} />
          <Route path="/premium-user" element={<PremiumUserPage />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;