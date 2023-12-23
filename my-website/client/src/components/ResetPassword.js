import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api'; // Assuming you have an Axios instance set up for your API
import NavigationBar from './NavigationBar';
import '../styles/NavigationBar.css';
import '../styles/LoginForm.css'; // CSS for styling the form

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token } = useParams(); // Assuming the token is passed as a URL parameter

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Call the API function for resetting password
      const response = await api.postResetPassword(token, password);
      setMessage(response.data.message); // Example message: 'Password reset successfully'

      // Redirect to login after a delay
      setTimeout(() => navigate('/login'), 5000);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || 'Failed to reset password.');
      } else {
        setError('Error: ' + error.message);
      }
      console.error("Reset password error:", error);
    }
  };

  return (
    <div className="main-container">
      <NavigationBar />
      <div className="card">
        <h2 className="text-center">Reset Password</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">New Password:</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm New Password:</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Reset Password</button>
          <div className="text-center mt-3">
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordForm;
