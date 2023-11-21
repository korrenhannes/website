import React, { useState } from 'react';
import axios from 'axios';

function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      onLoginSuccess(response.data);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Enter your email:
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Enter your password:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
        </div>
        <div>
          <button type="submit">Login</button>
        </div>
        <div>
          <a href="/forgot-password">Forgot password?</a>
        </div>
        <div>
          Don’t have an account? <a href="/signup">Signup</a>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
