import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Components & Pages
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProjectPage from './pages/ProjectPage'; // We will create this next

// PrivateRoute: Only allows logged-in users, otherwise redirects to login
const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

// GuestRoute: Only allows guests (not logged-in), otherwise redirects to dashboard
const GuestRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? <Navigate to="/" /> : children;
};

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route 
              path="/login" 
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <GuestRoute>
                  <RegisterPage />
                </GuestRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/projects/:id" 
              element={
                <PrivateRoute>
                  <ProjectPage />
                </PrivateRoute>
              } 
            />
          </Routes>
        </main>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
};

export default App;
