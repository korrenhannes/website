import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api'; // Adjust this path as needed
import NavigationBar from './NavigationBar';
import '../styles/NavigationBar.css';

// Import the Google and Facebook login components
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/cloud-api');
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleGoogleLogin = async (googleData) => {
    try {
      const response = await api.post('/auth/google-login', {
        token: googleData?.credential,
      });
      localStorage.setItem('token', response.data.token);
      navigate('/cloud-api');
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  const handleFacebookLogin = async (facebookData) => {
    try {
      const response = await api.post('/auth/facebook-login', {
        accessToken: facebookData.accessToken,
        userID: facebookData.userID
      });
      localStorage.setItem('token', response.data.token);
      navigate('/cloud-api');
    } catch (error) {
      console.error("Facebook login failed:", error);
    }
  };

  return (
    <div className="main-container">
      <NavigationBar />
      <div className="container mt-5 pt-5">
        <h2 className="text-center">Login</h2>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <form onSubmit={handleSubmit} className="card p-4">
              {/* Existing form fields */}
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
              <div className="mt-3">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
              <div className="mt-3">
                Don’t have an account? <Link to="/signup">Signup</Link>
              </div>
            </form>
            <div className="social-login">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => console.log("Google login failed")}
              />
              <FacebookLogin
                appId="YOUR_FACEBOOK_APP_ID"
                onSuccess={handleFacebookLogin}
                onFailure={() => console.log("Facebook login failed")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
