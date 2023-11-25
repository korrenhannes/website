import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api'; // Ensure this path is correct
import NavigationBar from './NavigationBar'; // Import the navigation bar component
import '../styles/NavigationBar.css'; // Import the navigation bar styles

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
      // Navigate to the offers page upon successful signup
      navigate('/offers');
    } catch (error) {
      // Handling error response for better user feedback
      if (error.response && error.response.data) {
        setError("Signup failed: " + error.response.data.message); // Adjusted for better error handling
      } else {
        setError("Signup failed. Please try again.");
      }
    }
  };

  return (
    <>
      <NavigationBar /> {/* This includes the navigation bar at the top */}
      <div className="container mt-5" style={{ paddingTop: '60px' }}> {/* Add padding to push content down */}
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
          </div>
        </div>
      </div>
    </>
  );
}

export default SignupForm;
