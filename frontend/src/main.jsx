import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the entire app with our AuthProvider to give everything access to login state */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
