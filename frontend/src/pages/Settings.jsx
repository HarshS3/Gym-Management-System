import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar.jsx';
import { FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { config } from '../config/config.js';

const Settings = () => {
  const [gymName, setGymName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load existing gym name from localStorage (or fetch from backend)
    const storedName = localStorage.getItem('gymName') || '';
    setGymName(storedName);
  }, []);

  const saveSettings = async () => {
    if (!gymName.trim()) {
      toast.error('Gym name cannot be empty');
      return;
    }
    try {
      setSaving(true);

      // OPTIONAL: send to backend if endpoint exists
      // await axios.put(`${config.apiUrl}/gym/update`, { name: gymName }, { withCredentials: true });

      localStorage.setItem('gymName', gymName);
      window.dispatchEvent(new Event('storage')); // notify other tabs
      toast.success('Gym name updated');
    } catch (err) {
      console.error('Failed to save settings', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Sidebar />
      <div className="flex bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="ml-64 w-full min-h-screen p-10 text-white overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-gray-400">Update your basic gym details</p>
          </div>

          {/* Simple Gym Name Form */}
          <div className="bg-white/10 rounded-xl border border-white/10 p-8 max-w-xl">
            <h2 className="text-2xl font-semibold mb-6">Gym Information</h2>

            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="gymName">Gym Name</label>
            <input
              id="gymName"
              type="text"
              value={gymName}
              onChange={e => setGymName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter gym name"
            />

            <button
              onClick={saveSettings}
              disabled={saving}
              className="mt-6 flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60">
              <FaSave />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 