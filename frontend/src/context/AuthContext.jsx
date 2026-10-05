import { createContext, useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // helps handle initial page load

  // On first load, check if token exists and fetch user profile
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('jait_token');
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('jait_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Register function
  const register = async (name, email, password) => {
    try {
      const res = await apiClient.post('/auth/register', { name, email, password });
      localStorage.setItem('jait_token', res.data.token);
      setUser(res.data);
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('jait_token', res.data.token);
      setUser(res.data);
      toast.success('Welcome back!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('jait_token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
