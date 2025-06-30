import React, { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { config } from '../config/config.js';
import { toast } from 'react-hot-toast';

const AddEquipmentModal = ({ isOpen, onClose, onAdded }) => {
  const [form, setForm] = useState({
    name: '',
    muscleGroup: '',
    location: '',
    quantity: 1,
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post(`${config.apiUrl}/equipment`, form, { withCredentials: true });
      if (data.success) {
        toast.success('Equipment added');
        onAdded();
        onClose();
      }
    } catch (err) {
      console.error('Error adding equipment', err);
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Add Equipment</h2>
          <button onClick={onClose}><FaTimes className="text-white" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Name" className="w-full p-2 rounded bg-white/10 border border-white/20 text-white" />
          <input name="muscleGroup" value={form.muscleGroup} onChange={handleChange} required placeholder="Muscle Group" className="w-full p-2 rounded bg-white/10 border border-white/20 text-white" />
          <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="w-full p-2 rounded bg-white/10 border border-white/20 text-white" />
          <input type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} placeholder="Quantity" className="w-full p-2 rounded bg-white/10 border border-white/20 text-white" />
          <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 rounded bg-white/10 border border-white/20 text-white">
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
          <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white disabled:opacity-60">
            <FaPlus /> {loading ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEquipmentModal; 