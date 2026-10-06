import axios from 'axios';

// Create an Axios instance with our backend URL
// Uses the VITE_API_URL from .env if available, otherwise falls back to the deployed Render URL
const apiClient = axios.create({
  baseURL: 'https://jait-lite.onrender.com/api',
});

// Request Interceptor: Automatically attach the JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jait_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
