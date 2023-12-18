import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api'; // Ensure this is the correct import for your API calls
import { GoogleLogin } from '@react-oauth/google'; // Import GoogleLogin
import FacebookLogin from '@greatsumini/react-facebook-login'; // Import FacebookLogin
import NavigationBar from './NavigationBar';
import '../styles/NavigationBar.css';
import '../styles/LoginForm.css'; // Import CSS styles

function SignupForm({ onSignupSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Reset error message

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await api.post('/auth/signup', { email, password });
      localStorage.setItem('userEmail', email); // Store email in local storage
      onSignupSuccess(response.data);
      navigate('/confirmation-wait'); // Navigate to confirmation-wait page
    } catch (error) {
      if (error.response && error.response.data) {
        setError("Signup failed: " + error.response.data.message);
      } else {
        navigate('/confirmation-wait'); // Navigate to confirmation-wait page
      }
    }
  };


  const handleGoogleSignup = async (googleData) => {
    console.log("Google signup data:", googleData);
    // Example: await api.post('/auth/google-signup', { token: googleData.credential });
    // Navigate or set state based on response
  };

  // Add a new function to handle Facebook signup
  const handleFacebookSignup = async (facebookData) => {
    try {
      // Send the Facebook data to your backend
      const response = await api.post('/auth/facebook-signup', {
        accessToken: facebookData.accessToken,
        userID: facebookData.userID
      });
      // Handle the response, e.g., navigate or set state
      console.log(response.data);
      navigate('/some-path-on-success'); // Update this path as needed
    } catch (error) {
      console.error("Facebook signup failed:", error);
    }
  };

  return (
    <div className="main-container">
      <div className="card">
        <h2 className="text-center">Signup</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="mb-3">
            <label className="form-label">Enter your email:</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Create a password:</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm your password:</label>
            <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Signup</button>
          <div className="text-center mt-3">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
        <div className="social-login" hidden= "True">
          <GoogleLogin
            onSuccess={handleGoogleSignup}
            onError={() => console.log("Google signup failed")}
          />
          <FacebookLogin
            appId="YOUR_FACEBOOK_APP_ID" // Replace with your actual Facebook App ID
            onSuccess={handleFacebookSignup}
            onFailure={() => console.log("Facebook signup failed")}
          />
        </div>
      </div>
    </div>
  );
}

export default SignupForm;