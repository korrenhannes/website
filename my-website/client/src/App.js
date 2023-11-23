import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import CloudAPIPage from './components/CloudAPIPage'; // Import the new component

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
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
