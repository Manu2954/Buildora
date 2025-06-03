import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // change to your actual backend URL
  withCredentials: true // needed for refresh token cookies
});

export default api;
