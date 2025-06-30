import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaDumbbell,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";
import axios from "axios";
import { config } from "../config/config.js";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const menuItems = [
    { icon: <FaHome />, label: "Dashboard", path: "/dashboard" },
    { icon: <FaUsers />, label: "Members", path: "/members" },
    { icon: <FaDumbbell />, label: "Equipment", path: "/equipment" },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
    { icon: <FaSignOutAlt />, label: "Logout", path: "/login" },
  ];
  const [greeting, setGreeting] = useState("");
  useEffect(()=>{
    const hour = new Date().getHours();
    if(hour < 12) setGreeting("Good Morning");
    else if(hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  },[]);

  const handleLogout = async () => {
    try {
      await axios.post(`${config.apiUrl}/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('gymName');
      // Dispatch custom event to notify App.js about the logout state change
      window.dispatchEvent(new Event('loginStateChanged'));
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear localStorage even if backend call fails
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('gymName');
      // Dispatch custom event to notify App.js about the logout state change
      window.dispatchEvent(new Event('loginStateChanged'));
      navigate('/login');
    }
  };

  const isActive = (path) => {
    if (path === '/members') {
      return location.pathname === '/members' ||
             location.pathname.startsWith('/members/') ||
             ['/new-registrations', '/expiring-memberships'].includes(location.pathname);
    }
    return location.pathname === path;
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-screen w-64 bg-gradient-to-b from-[#0f0f0f] to-black text-white shadow-2xl p-6 fixed left-0 top-0 z-20 border-r border-white/10"
    >
      <h1 className="text-3xl font-extrabold mb-10 text-center tracking-wider text-white">
        Gym<span className="text-blue-400">MS</span>
      </h1>
      <p className="text-white text-lg text-center mb-6 -mt-3"> {greeting}, <span className="text-blue-400 font-bold">{localStorage.getItem("gymName")}</span></p>
      <hr className="border-white/10 mb-6" />
      <ul className="space-y-4 border-b border-white/10 pb-6">
        {menuItems.map((item, index) => (
          <li key={index}>
            {item.label === "Logout" ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-white/10 w-full text-left"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-base font-medium">{item.label}</span>
              </button>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-white/10 ${
                  isActive(item.path) ? 'bg-white/10 text-blue-400' : ''
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-base font-medium">{item.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default Sidebar;
