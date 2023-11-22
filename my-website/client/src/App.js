import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';

function App() {
  const handleLoginSuccess = (data) => {
    console.log('Logged in user:', data);
    // You can add redirect or state management logic here
  };

  const handleSignupSuccess = (data) => {
    console.log('Signed up user:', data);
    // You can add redirect or state management logic here
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/signup" element={<SignupForm onSignupSuccess={handleSignupSuccess} />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
