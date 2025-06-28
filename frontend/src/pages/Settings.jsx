import React from 'react';
import Sidebar from '../components/sidebar.jsx';
import { FaCog, FaUserCog, FaBell, FaShieldAlt, FaPalette } from 'react-icons/fa';

const Settings = () => {
  const settingsCategories = [
    {
      title: "Account Settings",
      description: "Manage your gym account information",
      icon: <FaUserCog className="text-2xl" />,
      color: "from-blue-500 to-blue-600",
      items: ["Profile Information", "Password Change", "Email Preferences"]
    },
    {
      title: "Gym Settings",
      description: "Configure gym-specific settings",
      icon: <FaCog className="text-2xl" />,
      color: "from-green-500 to-green-600",
      items: ["Gym Information", "Operating Hours", "Contact Details"]
    },
    {
      title: "Notification Settings",
      description: "Manage notification preferences",
      icon: <FaBell className="text-2xl" />,
      color: "from-purple-500 to-purple-600",
      items: ["Email Notifications", "SMS Alerts", "System Notifications"]
    },
    {
      title: "Security Settings",
      description: "Manage security and privacy",
      icon: <FaShieldAlt className="text-2xl" />,
      color: "from-red-500 to-red-600",
      items: ["Two-Factor Authentication", "Login History", "Privacy Settings"]
    },
    {
      title: "Appearance",
      description: "Customize the interface",
      icon: <FaPalette className="text-2xl" />,
      color: "from-yellow-500 to-yellow-600",
      items: ["Theme Selection", "Color Scheme", "Layout Options"]
    }
  ];

  return (
    <div>
      <Sidebar />
      <div className="flex bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="ml-64 w-full min-h-screen p-10 text-white overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-gray-400">Configure your gym management system</p>
          </div>

          {/* Coming Soon Message */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="text-center">
              <FaCog className="text-6xl text-blue-400 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-white mb-2">Settings Coming Soon</h2>
              <p className="text-gray-300 mb-4">
                We're working hard to bring you comprehensive settings and configuration options.
                This feature will be available in the next update.
              </p>
              <div className="bg-white/10 rounded-lg p-4 inline-block">
                <p className="text-sm text-gray-400">
                  Expected Release: <span className="text-blue-400 font-semibold">Version 2.0</span>
                </p>
              </div>
            </div>
          </div>

          {/* Settings Categories Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsCategories.map((category, index) => (
              <div key={index} className="bg-white/10 rounded-xl border border-white/10 p-6 hover:bg-white/15 transition-all duration-300">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-white mb-4`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{category.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-gray-500 flex items-center">
                      <div className="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Current Available Settings */}
          <div className="mt-8 bg-white/10 rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Currently Available</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-green-400 mb-2">Member Management</h4>
                <p className="text-sm text-gray-400">Add, edit, and manage gym members</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-green-400 mb-2">Membership Plans</h4>
                <p className="text-sm text-gray-400">Create and manage membership plans</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-green-400 mb-2">Revenue Tracking</h4>
                <p className="text-sm text-gray-400">Monitor gym revenue and analytics</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-green-400 mb-2">Equipment Management</h4>
                <p className="text-sm text-gray-400">Track equipment status and maintenance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 