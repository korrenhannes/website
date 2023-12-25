import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar'; // Assuming you have a NavigationBar component
import '../styles/LoginForm.css'; // CSS for this page
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap for styling
import { api } from '../api';

function AffiliateSignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.registerAsAffiliate({ email, password });
            setSuccess(true);
            navigate('/affiliate-dashboard'); // Redirect to dashboard after successful registration
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="affiliate-signup-container">
            <NavigationBar />
            <div className="affiliate-signup-form">
                <h2>Become an Affiliate Partner</h2>
                <form onSubmit={handleRegister}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">Registration successful!</div>}
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            id="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            id="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Register</button>
                </form>
            </div>
        </div>
    );
}

export default AffiliateSignupPage;
