import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Make sure this points to your backend server
  withCredentials: true // Include this line to send credentials like cookies or auth tokens
});

export default api;
