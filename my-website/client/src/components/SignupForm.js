import React, { useState } from 'react';
import axios from 'axios';

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
      const response = await axios.post('/api/auth/signup', { email, password });
      onSignupSuccess(response.data);
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="signup-form">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Enter your email:
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Create a password:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Confirm your password:
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </label>
        </div>
        <div>
          <button type="submit">Signup</button>
        </div>
        <div>
          Already have an account? <a href="/login">Login</a>
        </div>
      </form>
    </div>
  );
}

export default SignupForm;
