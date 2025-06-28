import React, { useState, useEffect } from 'react';
import InfoListPage from '../components/InfoListPage';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const NewRegistrations = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNewRegistrations();
  }, []);

  const fetchNewRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/members/monthly-members', {
        withCredentials: true
      });
      
      if (response.data.success) {
        setMembers(response.data.monthlyMembers || []);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Error fetching new registrations:', err);
      setError('Failed to fetch new registrations');
      toast.error('Failed to fetch new registrations');
    } finally {
      setLoading(false);
    }
  };

  // Calculate days since joining
  const getDaysSinceJoining = (joinDate) => {
    const join = new Date(joinDate);
    const now = new Date();
    const diff = (now - join) / (1000 * 60 * 60 * 24);
    return Math.floor(diff);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Loading new registrations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-400 text-center">
          <p>Error: {error}</p>
          <button 
            onClick={fetchNewRegistrations}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <InfoListPage
      title={`New Registrations This Month (${members.length})`}
      items={members}
      renderItem={member => (
        <div className="flex items-center gap-6 bg-white/10 rounded-xl p-6 shadow-lg border border-blue-500/30 hover:bg-white/20 transition-all">
          {member.profileImage ? (
            <img
              src={member.profileImage}
              alt={member.name}
              className="w-14 h-14 rounded-full object-cover border-4 border-white/20"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center font-bold text-2xl border-4 border-white/20 text-white">
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="font-semibold text-white text-lg">
              <Link to={`/members/${member._id}`} className="hover:text-blue-400 underline-offset-2 hover:underline transition-colors">{member.name}</Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm mt-1">
              <span className={`px-2 py-1 rounded-full ${member.membership?.months >= 6 ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                {member.membership ? `${member.membership.months} Month${member.membership.months > 1 ? 's' : ''}` : 'N/A'}
              </span>
              <span className={`px-2 py-1 rounded-full ${member.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {member.status}
              </span>
              <span className="px-2 py-1 rounded-full bg-gray-700/40 text-gray-300">
                Joined: {formatDate(member.joinDate)}
              </span>
              <span className="px-2 py-1 rounded-full bg-blue-700/40 text-blue-300">
                {getDaysSinceJoining(member.joinDate)} days ago
              </span>
            </div>
            <div className="flex flex-wrap gap-6 mt-2 text-gray-400 text-sm">
              <span>Email: {member.email}</span>
              <span>Phone: {member.phone}</span>
              <span>Last Visit: {formatDate(member.lastVisit)}</span>
              <span>Age: {member.age} yrs</span>
            </div>
          </div>
          <div className="ml-4">
            <Link 
              to={`/members/${member._id}`}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow transition-all"
            >
              View Details
            </Link>
          </div>
        </div>
      )}
    />
  );
};

export default NewRegistrations; 