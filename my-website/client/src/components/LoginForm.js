import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import api from '../api'; // Adjust this path as needed
=======
import { api } from '../api'; // Importing the Axios instance for Flask
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
import NavigationBar from './NavigationBar';
import '../styles/NavigationBar.css';
import '../styles/LoginForm.css'; // Import the new CSS styles

// Import the Google and Facebook login components
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
<<<<<<< HEAD
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/cloud-api');
    } catch (error) {
      console.error("Login failed:", error);
=======
  const [loginError, setLoginError] = useState(''); // State for handling login errors
  const navigate = useNavigate();

  const storeUserDataAndNavigate = (token, userId) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId); // Storing the user ID
    // Consider storing userId in a more secure way than localStorage
    // localStorage.setItem('userId', userId);
    navigate('/cloud-api');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError(''); // Reset login error
    try {
      const response = await api.post('/auth/login', { email, password });
      storeUserDataAndNavigate(response.data.token, response.data.userId);
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError('Login failed. Please check your credentials.');
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
    }
  };

  const handleGoogleLogin = async (googleData) => {
<<<<<<< HEAD
=======
    setLoginError(''); // Reset login error
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
    try {
      const response = await api.post('/auth/google-login', {
        token: googleData?.credential,
      });
<<<<<<< HEAD
      localStorage.setItem('token', response.data.token);
      navigate('/cloud-api');
    } catch (error) {
      console.error("Google login failed:", error);
=======
      storeUserDataAndNavigate(response.data.token, response.data.userId);
    } catch (error) {
      console.error("Google login failed:", error);
      setLoginError('Google login failed. Please try again.');
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
    }
  };

  const handleFacebookLogin = async (facebookData) => {
<<<<<<< HEAD
=======
    setLoginError(''); // Reset login error
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
    try {
      const response = await api.post('/auth/facebook-login', {
        accessToken: facebookData.accessToken,
        userID: facebookData.userID
      });
<<<<<<< HEAD
      localStorage.setItem('token', response.data.token);
      navigate('/cloud-api');
    } catch (error) {
      console.error("Facebook login failed:", error);
    }
  };

=======
      storeUserDataAndNavigate(response.data.token, response.data.userId);
    } catch (error) {
      console.error("Facebook login failed:", error);
      setLoginError('Facebook login failed. Please try again.');
    }
  };
  
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
  return (
    <div className="main-container">
      <NavigationBar />
      <div className="card">
        <h2 className="text-center">Login</h2>
<<<<<<< HEAD
=======
        {loginError && <div className="alert alert-danger">{loginError}</div>}
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
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
        <div className="social-login">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
<<<<<<< HEAD
            onError={() => console.error("Google login failed")}
=======
            onError={() => {
              console.error("Google login failed");
              setLoginError('Google login failed. Please try again.');
            }}
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
            // Ensure your button rendering here matches the style you want
          />
          <FacebookLogin
            appId="YOUR_FACEBOOK_APP_ID" // Replace with your actual Facebook App ID
            onSuccess={handleFacebookLogin}
<<<<<<< HEAD
            onFailure={() => console.error("Facebook login failed")}
=======
            onFailure={() => {
              console.error("Facebook login failed");
              setLoginError('Facebook login failed. Please try again.');
            }}
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
            // Ensure your button rendering here matches the style you want
          />
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default LoginForm;
=======
export default LoginForm;
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
