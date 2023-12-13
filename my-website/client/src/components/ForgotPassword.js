import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api'; // Assuming you have an Axios instance set up for your API
import NavigationBar from './NavigationBar';
import '../styles/NavigationBar.css';
import '../styles/LoginForm.css'; // CSS for styling the form

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      // Here you would call your backend API to handle the password reset
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message); // Message like 'Check your email for the reset link'
      setTimeout(() => navigate('/login'), 5000); // Redirect to login after 5 seconds
    } catch (error) {
      console.error("Forgot password error:", error);
      setError(error.response.data.message || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="main-container">
      <NavigationBar />
      <div className="card">
        <h2 className="text-center">Forgot Password</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
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
          <button type="submit" className="btn btn-primary">Send Reset Link</button>
          <div className="text-center mt-3">
            Remembered your password? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
