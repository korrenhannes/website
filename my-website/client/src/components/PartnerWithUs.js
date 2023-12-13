import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import '../styles/LoginForm.css'; // Reusing the same CSS file for consistent styling
import 'bootstrap/dist/css/bootstrap.min.css';
import { api } from '../api';

function PartnerWithUsPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.registerAffiliate({ email, password });
      navigate('/affiliate-dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration error. Please try again.');
    }
  };

  const handleLogin = async () => {
    try {
      await api.loginAffiliate({ email, password });
      navigate('/affiliate-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Login error. Please try again.');
    }
  };

  return (
    <div className="main-container">
      <NavigationBar />
      <div className="card">
        <h2 className="text-center">Become a Partner</h2>
        <p className="text-center">Join our affiliate program and earn commissions for every customer you refer.</p>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="affiliate-form">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleRegister}>Register as Affiliate</button>
          <button className="btn btn-primary" onClick={handleLogin}>Login to Dashboard</button>
        </div>
      </div>
    </div>
  );
}

export default PartnerWithUsPage;
