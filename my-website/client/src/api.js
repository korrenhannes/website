import axios from 'axios';

// Axios instance for the server running on port 3000
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Assuming token is stored in local storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios instance for the Flask server running on port 5000
const apiFlask = axios.create({
  baseURL: process.env.REACT_APP_FLASK_API_URL,
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


// Function to send confirmation code
api.sendConfirmationCode = async (email) => {
  return await api.post('/auth/send-confirmation', { email });
};

// Function to check email confirmation status
api.checkConfirmation = async (email) => {
  return await api.get(`/auth/check-confirmation?email=${email}`);
};

// Function to verify confirmation code
api.verifyConfirmationCode = async (email, confirmationCode) => {
  return await api.post('/auth/verify-confirmation', { email, confirmationCode });
};

export { api, apiFlask };
