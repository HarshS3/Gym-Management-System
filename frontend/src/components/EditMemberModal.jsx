import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { config } from '../config/config.js';

// Simple modal to edit a member's basic details
const EditMemberModal = ({ isOpen, onClose, member, onUpdated }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    age: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        address: member.address || '',
        age: member.age || '',
        profileImage: member.profileImage || ''
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.put(`${config.apiUrl}/members/update-member/${member._id}`, form, { withCredentials: true });
      if (data.success) {
        toast.success('Member updated');
        onUpdated();
        onClose();
      }
    } catch (err) {
      console.error('Error updating member', err);
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-lg border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Edit Member</h2>
          <button onClick={onClose}><FaTimes className="text-white" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Name" className="w-full p-2 rounded bg-white/10 border border-white/20 text-white" />
            <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="Age" className="w-full p-2 rounded bg-white/10 border border-white/20 text-white" />
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full p-2 rounded bg-white/10 border border-white/20 text-white" />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 rounded bg-white/10 border border-white/20 text-white" />
            <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="w-full p-2 rounded bg-white/10 border border-white/20 text-white md:col-span-2" />
            <input name="profileImage" value={form.profileImage} onChange={handleChange} placeholder="Profile Image URL" className="w-full p-2 rounded bg-white/10 border border-white/20 text-white md:col-span-2" />
          </div>
          <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-2 bg-green-600 hover:bg-green-700 rounded text-white disabled:opacity-60">
            <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditMemberModal; 