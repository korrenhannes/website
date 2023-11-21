import React from 'react';
import LoginForm from '.C:/Users/SharonH/Documents/GitHub/website/my-website/client/src/components/LoginForm';
import SignupForm from '.C:/Users/SharonH/Documents/GitHub/website/my-website/client/src/components/SignupForm';

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