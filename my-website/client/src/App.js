import React from 'react';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';

function App() {
  const handleLoginSuccess = (data) => {
    console.log('Logged in user:', data);
    // Redirect or manage login state
  };

  const handleSignupSuccess = (data) => {
    console.log('Signed up user:', data);
    // Redirect or manage signup state
  };

  return (
    <div className="App">
      <LoginForm onLoginSuccess={handleLoginSuccess} />
      <SignupForm onSignupSuccess={handleSignupSuccess} />
    </div>
  );
}

export default App;
