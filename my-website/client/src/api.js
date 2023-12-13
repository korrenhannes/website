import axios from 'axios';

// Axios instance for the server running on port 3000
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  withCredentials: true
});

// Axios instance for the Flask server running on port 5000
const apiFlask = axios.create({
  baseURL: process.env.REACT_APP_FLASK_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

// Function to handle forgot password request
api.postForgotPassword = async (email) => {
  return await api.post('/auth/forgot-password', { email });
};

// Function to handle reset password request
api.postResetPassword = async (token, password) => {
  return await api.post('/auth/reset-password', { token, password });
};

// Function to register as an affiliate
api.registerAffiliate = async ({ email, password }) => {
  return await api.post('/auth/register', { email, password });
};

// Function for affiliate login
api.loginAffiliate = async ({ email, password }) => {
  return await api.post('/auth/logina', { email, password });
};

// Function to fetch affiliate data
api.getAffiliateData = async () => {
  return await api.get('/auth/data'); // Adjust the endpoint as needed
};


export { api, apiFlask };
