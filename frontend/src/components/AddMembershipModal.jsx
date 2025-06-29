import React, { useState,useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AddMembershipModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    months: '',
    price: '',
  });
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMemberships = async () => {
    try {
      // console.log("AddMembershipModal: Fetching memberships...");
      const response = await axios.get('http://localhost:5000/plans/get-membership', {
        withCredentials: true
      });
      // console.log("AddMembershipModal: Membership response:", response.data);
      // console.log("AddMembershipModal: Memberships count:", response.data.membership?.length || 0);
      
      if (response.data.success) {
        setMemberships(response.data.membership || []);
      }
    } catch (error) {
      console.error('Error fetching memberships:', error);
    }
  };

  useEffect(() => {
    if(isOpen){
      fetchMemberships();
    }
  }, [isOpen]);

  

  const handleChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.months || !formData.price) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      // console.log("Adding membership:", formData);
      
      const response = await axios.post(
        'http://localhost:5000/plans/add-membership',
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        // console.log("Membership added successfully:", response.data);
        toast.success('Membership plan added successfully!');
        setFormData({ months: '', price: '' });
        onClose();
        // Refresh the memberships list
        fetchMemberships();
      } else {
        toast.error(response.data.message || 'Failed to add membership plan');
      }
    } catch (error) {
      console.error('Error adding membership:', error);
      toast.error('Error adding membership plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl w-full max-w-lg border border-white/20 shadow-xl">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Add Membership</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>

          {/* Membership Cards Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Existing Membership Plans</h3>
              <button
                type="button"
                onClick={fetchMemberships}
                disabled={loading}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 rounded-lg transition-all text-white text-sm"
                title="Refresh membership plans"
              >
                {loading ? '↻' : 'Refresh'}
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-400">Loading membership plans...</p>
              </div>
            ) : memberships.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {memberships.map((membership) => (
                  <div key={membership._id} className="bg-white/10 border border-green-500/20 rounded-xl p-4 flex flex-col items-center shadow">
                    <div className="text-lg font-bold text-green-400 mb-1">{membership.months} Month{membership.months > 1 ? 's' : ''}</div>
                    <div className="text-base text-white mb-1">₹{membership.price}</div>
                    <div className="text-gray-400 text-xs">ID: {membership._id}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                <p className="text-gray-400 mb-2">No membership plans found</p>
                <p className="text-sm text-gray-500">Add your first membership plan below</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Months Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (Months)
                </label>
                <input
                  type="number"
                  name="months"
                  value={formData.months}
                  onChange={(e) => handleChange(e, 'months')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  min="1"
                  max="60"
                  required
                />
              </div>

              {/* Price Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={(e) => handleChange(e, 'price')}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-800 hover:bg-white/20 rounded-lg transition-all text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all text-white"
              >
                Add Membership
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMembershipModal; 