import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api'; // Ensure this path is correct
import { GoogleLogin } from '@react-oauth/google'; // Import GoogleLogin
import NavigationBar from './NavigationBar';
import '../styles/NavigationBar.css';

function SignupForm() {
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
      await api.post('/auth/signup', { email, password });
      navigate('/offers');
    } catch (error) {
      if (error.response && error.response.data) {
        setError("Signup failed: " + error.response.data.message);
      } else {
        setError("Signup failed. Please try again.");
      }
    }
  };

  const handleGoogleSignup = async (googleData) => {
    // Here, you might want to send the Google token to your backend
    // and handle the signup process
    console.log("Google signup data:", googleData);
    // Example: await api.post('/auth/google-signup', { token: googleData.credential });
    // Navigate or set state based on response
  };

  return (
    <>
      <NavigationBar />
      <div className="container mt-5" style={{ paddingTop: '60px' }}>
        <h2 className="text-center">Signup</h2>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <form onSubmit={handleSubmit} className="card p-4">
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
              <div className="mt-3">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </form>
            <div className="social-signup">
              <GoogleLogin 
                onSuccess={handleGoogleSignup} 
                onError={() => console.log("Google signup failed")}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignupForm;
