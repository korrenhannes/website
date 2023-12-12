import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api'; // Importing the Axios instance for Flask
import NavigationBar from './NavigationBar';
import '../styles/NavigationBar.css';
import '../styles/LoginForm.css'; // Import the new CSS styles

// Import the Google and Facebook login components
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(''); // State for handling login errors
  const navigate = useNavigate();

  const storeUserDataAndNavigate = (token, userId, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('email', email); // Storing the user email
    navigate('/cloud-api');
  };
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError(''); // Reset login error
    try {
      const response = await api.post('/auth/login', { email, password });
      storeUserDataAndNavigate(response.data.token, response.data.userId, email);
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
      storeUserDataAndNavigate(response.data.token, response.data.userId, response.data.email);
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
      storeUserDataAndNavigate(response.data.token, response.data.userId, response.data.email);
    } catch (error) {
      console.error("Facebook login failed:", error);
      setLoginError('Facebook login failed. Please try again.');
    }
  };
  
  return (
    <div className="main-container">
      <NavigationBar />
      <div className="card">
        <h2 className="text-center">Login</h2>
        {loginError && <div className="alert alert-danger">{loginError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Enter your email:</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Enter your password:</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
          <div className="text-center mt-3">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <div className="text-center mt-3">
            Don’t have an account? <Link to="/signup">Signup</Link>
          </div>
        </form>
        <div className="social-login" hidden='True'>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              console.error("Google login failed");
              setLoginError('Google login failed. Please try again.');
            }}
            // Ensure your button rendering here matches the style you want
          />
          <FacebookLogin
            appId="YOUR_FACEBOOK_APP_ID" // Replace with your actual Facebook App ID
            onSuccess={handleFacebookLogin}
            onFailure={() => {
              console.error("Facebook login failed");
              setLoginError('Facebook login failed. Please try again.');
            }}
            // Ensure your button rendering here matches the style you want
          />
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
