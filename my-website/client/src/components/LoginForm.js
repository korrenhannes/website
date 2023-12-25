import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api'; // Importing the Axios instance for Flask
import '../styles/NavigationBar.css';
import '../styles/LoginForm.css'; // Import the new CSS styles
import { MESSAGES } from '../messages/messages'; // Import the language file
import logo from '../assets/Untitled.png'; // Adjust the path as per your directory structure


// Import the Google and Facebook login components
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';

function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(''); // State for handling login errors
  const navigate = useNavigate();
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError(''); // Reset login error
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Check if the email is confirmed
      if (response.data.isConfirmed) {
        onLoginSuccess(response.data);
        navigate('/cloud-api');
      } else {
        setLoginError('Please confirm your email before logging in.');
      }
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError('Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async (googleData) => {
    setLoginError(''); // Reset login error
    try {
      const response = await api.post('/auth/google-login', {
        token: googleData?.credential,
      });
      onLoginSuccess(response.data);
      navigate('/cloud-api');
    } catch (error) {
      console.error("Google login failed:", error);
      setLoginError('Google login failed. Please try again.');
    }
  };

  const handleFacebookLogin = async (facebookData) => {
    setLoginError(''); // Reset login error
    try {
      const response = await api.post('/auth/facebook-login', {
        accessToken: facebookData.accessToken,
        userID: facebookData.userID
      });
      onLoginSuccess(response.data);
      navigate('/cloud-api');
    } catch (error) {
      console.error("Facebook login failed:", error);
      setLoginError('Facebook login failed. Please try again.');
    }
  };
  

  return (
    <div className="main-container">
      <div className="card">
        <img src={logo} alt="Logo" className="logo-img" /> {/* Add this line */}
        <h2 className="text-center">{MESSAGES.loginHeader}</h2>
        {loginError && <div className="alert alert-danger">{loginError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">{MESSAGES.enterEmailLabel}</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">{MESSAGES.enterPasswordLabel}</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">{MESSAGES.loginButton}</button>
          <div className="text-center mt-3">
            <Link to="/forgot-password">{MESSAGES.forgotPasswordLink}</Link>
          </div>
          <div className="text-center mt-3">
            {MESSAGES.signUpLink} <Link to="/signup">Signup</Link>
          </div>
        </form>
        <div className="social-login" hidden='True'>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              console.error("Google login failed");
              setLoginError(MESSAGES.loginError);
            }}
            // Ensure your button rendering here matches the style you want
          />
          <FacebookLogin
            appId="YOUR_FACEBOOK_APP_ID" // Replace with your actual Facebook App ID
            onSuccess={handleFacebookLogin}
            onFailure={() => {
              console.error("Facebook login failed");
              setLoginError(MESSAGES.loginError);
            }}
            // Ensure your button rendering here matches the style you want
          />
        </div>
      </div>
    </div>
  );
}

export default LoginForm;