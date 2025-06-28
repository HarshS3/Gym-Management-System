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
import MemberDetail from './components/MemberDetail.jsx';
import Equipment from './pages/Equipment.jsx';
import Settings from './pages/Settings.jsx';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

function App() {
    
  const [isLogin,setIsLogin] = useState(false);

  useEffect(()=>{
    const checkAuthStatus = () => {
      let isLoggedIn = localStorage.getItem('isLoggedIn');
      setIsLogin(isLoggedIn === 'true');
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
          <Route path="/members/:id" element={<MemberDetail />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/settings" element={<Settings />} />
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
