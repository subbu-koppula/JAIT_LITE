import axios from 'axios';

// Create an Axios instance with our backend URL
// (assuming backend runs on port 5000)
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
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
