import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api'; // Adjust the path to the api.js file
import NavigationBar from './NavigationBar'; // Import the navigation bar component
import '../styles/NavigationBar.css'; // Ensure you have this CSS for the navigation bar

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      // Store the token in local storage
      localStorage.setItem('token', response.data.token); // Assuming the token is in response.data.token

      // Navigate to the CloudAPIPage after successful login
      navigate('/cloud-api');
    } catch (error) {
      console.error("Login failed:", error);
      // You may want to show an error message to the user here
    }
  };

  return (
    <div className="main-container">
      <NavigationBar /> {/* Include the navigation bar */}
      <div className="container mt-5 pt-5"> {/* Add padding to the top */}
        <h2 className="text-center">Login</h2>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <form onSubmit={handleSubmit} className="card p-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
