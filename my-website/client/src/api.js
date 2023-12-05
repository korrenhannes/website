import axios from 'axios';

// Axios instance for the server running on port 3000
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true
});

// Axios instance for the Flask server running on port 5000
const apiFlask = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

export { api, apiFlask };
