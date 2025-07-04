import React, { useState,useEffect } from 'react';
import { FaTimes, FaUser, FaHeartbeat, FaRuler, FaDumbbell, FaUserTie, FaCreditCard } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { config } from '../config/config.js';
import { payWithRazorpay } from '../utils/payWithRazorpay';

// Pristine form template (outside component so it's not recreated on every render)
const emptyForm = {
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    profileImage: '',
    address: '',
  emergencyContact: { name: '', phone: '', relationship: '' },
    height: '',
    weight: '',
    bmi: '',
    bodyFat: '',
    muscleMass: '',
    bodyMeasurements: {
    chest: '', waist: '', hips: '', biceps: '', thighs: '', calves: '',
    wrist: '', neck: '', forearm: '', ankle: ''
    },
    workoutRoutine: {
    monday: 'Rest', tuesday: 'Rest', wednesday: 'Rest', thursday: 'Rest',
    friday: 'Rest', saturday: 'Rest', sunday: 'Rest'
    },
  personalTrainer: { name: '', phone: '' },
    notes: '',
    membership: '',
    nextBillDate: ''
};

const AddMemberModal = ({ isOpen, onClose, onMemberAdded }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [membershipsLoading, setMembershipsLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [memberships, setMemberships] = useState([]);
  const [selectedMembershipDetails, setSelectedMembershipDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending' | 'success'
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'online'
  const [isUploading, setIsUploading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  // Helper to reset all modal-specific state
  const resetModalState = () => {
    setFormData(emptyForm);
    setSelectedMembershipDetails(null);
    setActiveTab('basic');
    setPaymentMode('cash');
    setPaymentStatus('pending');
    setIsUploading(false);
    setPaymentInfo(null);
  };

  // When the modal is closed (isOpen -> false), reset internal state
  useEffect(() => {
    if (!isOpen) {
      resetModalState();
    }
  }, [isOpen]);

  const fetchMemberships = async () => {
    try {
      setMembershipsLoading(true);
      const response = await axios.get(`${config.apiUrl}/plans/get-membership`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setMemberships(response.data.membership || []);
      }
    } catch (error) {
      console.error('Error fetching memberships:', error);
    } finally {
      setMembershipsLoading(false);
    }
  };
  useEffect(() => {
    if(isOpen){
      fetchMemberships();
    }
  }, [isOpen]);

  // Calculate approximate body fat percentage using U.S. Navy method
  const calculateBodyFatPercentage = (measurements) => {
    const { chest, waist, hips, neck, height, weight } = measurements;
    
    // Need all measurements for calculation
    if (!chest || !waist || !hips || !neck || !height || !weight) {
      return null;
    }

    // Convert height from cm to inches if needed
    const heightInches = height > 100 ? height / 2.54 : height;
    
    // U.S. Navy method for body fat calculation
    // For men: BF% = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    // For women: BF% = 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
    
    // Assuming male calculation (you can add gender field if needed)
    const waistNeckDiff = waist - neck;
    if (waistNeckDiff <= 0) return null;
    
    const bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(waistNeckDiff) + 0.15456 * Math.log10(heightInches)) - 450;
    
    return Math.round(bodyFatPercentage * 10) / 10; // Round to 1 decimal place
  };

  const handleChange = (e, field, subField = null) => {
    const value = e.target.value;
    
    if (subField) {
      setFormData(prev => {
        const updatedData = {
          ...prev,
          [field]: {
            ...prev[field],
            [subField]: value
          }
        };

        // Calculate body fat percentage when body measurements change
        if (field === "bodyMeasurements") {
          const bodyFat = calculateBodyFatPercentage(updatedData.bodyMeasurements);
          if (bodyFat !== null) {
            updatedData.bodyFat = bodyFat;
          }
        }

        return updatedData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));

      // Calculate next bill date when membership is selected & reset payment status
      if (field === "membership") {
        const selectedMembership = memberships.find(m => m._id === value);
        if (selectedMembership) {
          const today = new Date();
          const nextBillDate = new Date(today);
          nextBillDate.setMonth(today.getMonth() + selectedMembership.months);

          setSelectedMembershipDetails(selectedMembership);
          setPaymentStatus('pending');

          setFormData(prev => ({
            ...prev,
            [field]: value,
            nextBillDate: nextBillDate.toISOString().split('T')[0]
          }));
        } else {
          // If no membership selected or invalid value, reset payment info
          setSelectedMembershipDetails(null);
          setPaymentStatus('pending');
          setFormData(prev => ({
            ...prev,
            [field]: value,
            nextBillDate: ''
          }));
        }
      }
    }
  };

  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const heightInMeters = formData.height / 100;
      const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
      setFormData({...formData, bmi: bmi});
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const memberName = formData.name.trim();
      const slug = memberName.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      const publicId = `${slug}-${Date.now()}`;
      const memberNameContext = `name=${memberName}`;
      // 1. Get a signed upload signature from backend
      const sigRes = await axios.get(`${config.apiUrl}/cloudinary/signature`, {
        params: { folder: 'members', context: memberNameContext, public_id: publicId },
        withCredentials: true,
      });

      const { timestamp, signature, apiKey, cloudName, folder, context, public_id } = sigRes.data;

      // 2. Upload to Cloudinary with the signature
      const data = new FormData();
      data.append('file', file);
      data.append('api_key', apiKey);
      data.append('timestamp', timestamp);
      data.append('signature', signature);
      data.append('folder', folder);
      // Send same context/public_id that were signed
      if (context) data.append('context', context);
      if (public_id) data.append('public_id', public_id);

      const uploadRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, data);

      const imageUrl = uploadRes.data.secure_url;

      setFormData(prev => ({
        ...prev,
        profileImage: imageUrl,
      }));
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (paymentMode === 'online' && paymentStatus !== 'success') {
      toast.error('Please complete the online payment before adding the member');
      return;
    }

    // Validate all required fields based on what's actually in the form
    const requiredFields = {
      'Name': formData.name,
      'Email': formData.email,
      'Phone': formData.phone,
      'Age': formData.age,
      'Gender': formData.gender,
      'Address': formData.address,
      'Membership Plan': formData.membership,
      'Height': formData.height,
      'Weight': formData.weight
    };

    const missingFields = [];
    for (const [fieldName, value] of Object.entries(requiredFields)) {
      if (!value || value.trim() === '') {
        missingFields.push(fieldName);
      }
    }

    // Check if profile image is selected
    if (!formData.profileImage) {
      missingFields.push('Profile Image');
    }

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate age (must be 18 or older)
    if (formData.age < 18) {
      toast.error('Member must be at least 18 years old');
      return;
    }

    // Validate height and weight
    if (formData.height < 100 || formData.height > 250) {
      toast.error('Please enter a valid height (100-250 cm)');
      return;
    }

    if (formData.weight < 30 || formData.weight > 300) {
      toast.error('Please enter a valid weight (30-300 kg)');
      return;
    }

    setLoading(true);
    try {
      // Prepare data in the format expected by the backend
      const payload = {
        ...formData,
        paymentMode,
        paymentInfo,
      };
      const response = await axios.post(`${config.apiUrl}/members/register-member`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });

      if (response.status === 201) {
        toast.success('Member added successfully!');
        // Refresh face encodings so the new member can be recognized immediately
        try {
          await axios.post(`${config.faceApiUrl}/refresh-faces`);
        } catch (refreshErr) {
          console.warn('Face API refresh failed:', refreshErr.message);
        }
        // Reset form data to initial state
        setFormData(emptyForm);
        onClose();
        if (onMemberAdded) {
          onMemberAdded();
        }
      }
    } catch (error) {
      console.error('Error adding member:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add member. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <FaUser /> },
    { id: 'health', label: 'Health Metrics', icon: <FaHeartbeat /> },
    { id: 'measurements', label: 'Body Measurements', icon: <FaRuler /> },
    { id: 'workout', label: 'Workout Routine', icon: <FaDumbbell /> },
    { id: 'trainer', label: 'Personal Trainer', icon: <FaUserTie /> },
    { id: 'payment', label: 'Payment', icon: <FaCreditCard /> }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl w-full max-w-6xl max-h-[90vh] border border-white/20 shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Add New Member</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange(e, "name")}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange(e, "email")}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange(e, "phone")}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Age *</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange(e, "age")}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    min="1"
                    max="120"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange(e, "gender")}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profile Image <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={handleImageChange}
                    required
                  />
                  {formData.profileImage && (
                    <div className="mt-4 flex justify-center items-center h-24 w-24 mx-auto">
                      {isUploading ? (
                        <svg
                          className="animate-spin h-8 w-8 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                      ) : (
                        <img
                          src={formData.profileImage}
                          alt="Profile Preview"
                          className="h-24 w-24 object-cover rounded-full border-2 border-blue-400 shadow"
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleChange(e, "address")}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white resize-none"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Membership Plan *</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.membership}
                      onChange={(e) => handleChange(e, "membership")}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                      required
                      disabled={membershipsLoading}
                      
                    >
                      <option value="">
                        {membershipsLoading ? "Loading plans..." : "Select Plan"}
                      </option>
                      {!membershipsLoading && memberships.length > 0 ? (
                        memberships.map((membership) => (
                          <option key={membership._id} value={membership._id}>
                            {membership.months} Month{membership.months > 1 ? 's' : ''} - ₹{membership.price}
                          </option>
                        ))
                      ) : !membershipsLoading && memberships.length === 0 ? (
                        <option value="" disabled>No membership plans available</option>
                      ) : null}
                    </select>
                    <button
                      type="button"
                      onClick={fetchMemberships}
                      disabled={membershipsLoading}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 rounded-lg transition-all text-white"
                      title="Refresh membership plans"
                    >
                      ↻
                    </button>
                  </div>
                  {!membershipsLoading && memberships.length === 0 && (
                    <p className="text-sm text-red-400 mt-1">
                      Please add membership plans first using the "Add Membership" button
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Next Bill Date *</label>
                  <input
                    type="date"
                    value={formData.nextBillDate}
                    onChange={(e) => handleChange(e, "nextBillDate")}
                    className="w-full px-4 py-2 bg-gray-800 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    required
                  />
                </div>
              </div>
            )}

            {/* Health Metrics Tab */}
            {activeTab === 'health' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm) *</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleChange(e, "height")}
                    onBlur={calculateBMI}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    min="100"
                    max="250"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg) *</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleChange(e, "weight")}
                    onBlur={calculateBMI}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    min="20"
                    max="300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">BMI</label>
                  <input
                    type="number"
                    value={formData.bmi}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-700 border border-white/20 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Body Fat (%)</label>
                  <input
                    type="number"
                    value={formData.bodyFat}
                    onChange={(e) => handleChange(e, "bodyFat")}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    min="0"
                    max="50"
                    step="0.1"
                    placeholder="e.g., 15.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Muscle Mass (kg)</label>
                  <input
                    type="number"
                    value={formData.muscleMass}
                    onChange={(e) => handleChange(e, "muscleMass")}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    min="0"
                    max="200"
                    step="0.1"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange(e, "notes")}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white resize-none"
                    rows="3"
                    placeholder="Any health conditions, allergies, preferences..."
                  />
                </div>
              </div>
            )}

            {/* Body Measurements Tab */}
            {activeTab === 'measurements' && (
              <div>
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-300">
                    💡 <strong>Tip:</strong> Body fat percentage will be calculated automatically when you fill in chest, waist, hips, and neck measurements.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries({
                    chest: { min: 50, max: 200 },
                    waist: { min: 40, max: 200 },
                    hips: { min: 50, max: 200 },
                    biceps: { min: 20, max: 100 },
                    thighs: { min: 30, max: 120 },
                    calves: { min: 20, max: 80 },
                    wrist: { min: 10, max: 30 },
                    neck: { min: 20, max: 80 },
                    forearm: { min: 15, max: 60 },
                    ankle: { min: 15, max: 50 }
                  }).map(([key, range]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                        {key} (cm) - ({range.min}-{range.max}cm)
                      </label>
                      <input
                        type="number"
                        value={formData.bodyMeasurements[key]}
                        onChange={(e) => handleChange(e, "bodyMeasurements", key)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                        min={range.min}
                        max={range.max}
                        step="0.1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workout Routine Tab */}
            {activeTab === 'workout' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(formData.workoutRoutine).map(([day, routine]) => (
                  <div key={day}>
                    <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                      {day}
                    </label>
                    <input
                      type="text"
                      value={routine}
                      onChange={(e) => handleChange(e, "workoutRoutine", day)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                      placeholder="e.g., Chest, Triceps"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Personal Trainer Tab */}
            {activeTab === 'trainer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Trainer Name</label>
                  <input
                    type="text"
                    value={formData.personalTrainer.name}
                    onChange={(e) => handleChange(e, "personalTrainer", "name")}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    placeholder="e.g., Rohit Mehra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Trainer Phone</label>
                  <input
                    type="tel"
                    value={formData.personalTrainer.phone}
                    onChange={(e) => handleChange(e, "personalTrainer", "phone")}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    placeholder="e.g., 9876543222"
                  />
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="flex flex-col items-center gap-6 py-10 text-center">
                {/* Payment Mode Selection */}
                <div className="flex gap-6">
                  {['cash', 'online'].map((mode) => (
                    <label key={mode} className="flex items-center gap-2 cursor-pointer select-none text-white">
                      <input
                        type="radio"
                        name="paymentMode"
                        value={mode}
                        checked={paymentMode === mode}
                        onChange={() => {
                          setPaymentMode(mode);
                          setPaymentStatus(mode === 'cash' ? 'success' : 'pending');
                        }}
                        className="form-radio h-5 w-5 text-blue-600"
                      />
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </label>
                  ))}
                </div>

                {selectedMembershipDetails ? (
                  <>
                    <p className="text-gray-300 mt-4">Membership Plan: {selectedMembershipDetails.months} Month{selectedMembershipDetails.months > 1 ? 's' : ''}</p>
                    <p className="text-gray-300">Amount: <span className="text-white font-bold">₹{selectedMembershipDetails.price}</span></p>

                    {paymentMode === 'online' && paymentStatus !== 'success' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedMembershipDetails) return;

                          const memberPlaceholder = {
                            name: formData.name || 'Member',
                            email: formData.email || 'example@example.com',
                            phone: formData.phone || '9999999999',
                            _id: 'temp',
                          };

                          payWithRazorpay({
                            member: memberPlaceholder,
                            membership: selectedMembershipDetails,
                            onSuccess: (razResp) => {
                          setPaymentStatus('success');
                              setPaymentInfo(razResp);
                              toast.success('Payment successful');
                            }
                          });
                        }}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-all"
                      >
                        Pay Now
                      </button>
                    )}

                    {paymentMode === 'cash' && (
                      <p className="text-green-500 font-medium">Cash payment will be collected at the desk.</p>
                    )}

                    {paymentMode === 'online' && paymentStatus === 'success' && (
                      <p className="text-green-500 font-medium">Payment Successful ✔</p>
                    )}
                  </>
                ) : (
                  <p className="text-red-400">Please select a membership plan first.</p>
                )}
              </div>
            )}
          </form>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-white/10">
            <div className="flex gap-2">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded text-sm ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-800 hover:bg-white/20 rounded-lg transition-all text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || (paymentMode === 'online' && paymentStatus !== 'success')}
                className={`px-6 py-2 rounded-lg transition-all text-white ${
                  loading || (paymentMode === 'online' && paymentStatus !== 'success')
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {loading
                  ? 'Adding...'
                  : paymentMode === 'online' && paymentStatus !== 'success'
                  ? 'Pay & Add Member'
                  : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal; 