import React, { useState } from 'react';
import api from '../api'; // Make sure this path is correct

function SignupForm({ onSignupSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }
    try {
      const response = await api.post('/auth/signup', { email, password });
      onSignupSuccess(response.data);
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Signup</h2>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSubmit} className="card p-4">
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
            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-primary">Signup</button>
            </div>
            <div className="mt-3 text-center">
              Already have an account? <a href="/login">Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;
