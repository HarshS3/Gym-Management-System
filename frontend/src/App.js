import './index.css';
import Home from './pages/home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/forgotPassword.jsx';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Members from './pages/Members.jsx';
import NewRegistrations from './pages/newRegistrations.jsx';
import ExpiringMemberships from './pages/expiringMemberships.jsx';
import ExpiredMemberships from './pages/expiredMemberships.jsx';
import MemberDetail from './components/MemberDetail.jsx';
import Equipment from './pages/Equipment.jsx';
import Settings from './pages/Settings.jsx';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { config } from './config/config.js';
import Revenue from './pages/Revenue.jsx';

function App() {
    
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(()=>{
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (isLoggedIn === 'true') {
          // Verify with backend to ensure session is still valid
          try {
            await axios.get(`${config.apiUrl}/auth/verify`, {
              withCredentials: true
            });
            setIsLogin(true);
          } catch (error) {
            // Session expired, clear localStorage
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('gymName');
            setIsLogin(false);
          }
        } else {
          setIsLogin(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLogin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
    
    // Listen for storage changes (when user logs in/out from different tab)
    window.addEventListener('storage', checkAuthStatus);
    
    // Listen for custom login state changes (same tab)
    window.addEventListener('loginStateChanged', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('loginStateChanged', checkAuthStatus);
    };
  },[]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {isLogin ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/register" element={<Navigate to="/dashboard" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/new-registrations" element={<NewRegistrations />} />
          <Route path="/expiring-memberships" element={<ExpiringMemberships />} />
          <Route path="/expired-memberships" element={<ExpiredMemberships />} />
          <Route path="/members/:id" element={<MemberDetail />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
      <Toaster />
    </div>
  );
}

export default App;
