import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/sidebar';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { config } from '../config/config.js';

const ExpiredMemberships = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [startFrom, setStartFrom] = useState(0);
  const [endTo, setEndTo] = useState(0);
  const limit = 10;

  const fetchExpiredMemberships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const skip = (currentPage - 1) * limit;
      const response = await axios.get(`${config.apiUrl}/members/expired-members?skip=${skip}&limit=${limit}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setMembers(response.data.members || []);
        setTotalMembers(response.data.totalMembers || response.data.expiredMembersCount || 0);
        
        const pages = Math.ceil(((response.data.totalMembers || response.data.expiredMembersCount || 0)) / limit);
        setTotalPages(pages);
        
        if (response.data.expiredMembersCount === 0) {
          setStartFrom(0);
          setEndTo(0);
        } else {
          setStartFrom(skip + 1);
          setEndTo(Math.min(skip + limit, response.data.expiredMembersCount));
        }
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Error fetching expired memberships:', err);
      setError('Failed to fetch expired memberships');
      toast.error('Failed to fetch expired memberships');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchExpiredMemberships();
  }, [currentPage, fetchExpiredMemberships]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && !members.length) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-400">Loading expired memberships...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !members.length) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="flex justify-center items-center min-h-screen">
            <div className="text-red-400 text-center">
              <p>Error: {error}</p>
              <button 
                onClick={fetchExpiredMemberships}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar />
      <div className="flex bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="ml-64 w-full min-h-screen p-8 text-white overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white">Expired Memberships</h1>
              <div className="text-sm text-gray-400">
                Total: <span className="font-medium text-white">{totalMembers}</span>
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-4">
              {members.map(member => (
                <div key={member._id} className="flex items-center gap-6 bg-white/10 rounded-xl p-6 shadow-lg border border-red-500/30 hover:bg-white/20 transition-all">
                  {member.profileImage ? (
                    <img
                      src={member.profileImage}
                      alt={member.name}
                      className="w-14 h-14 rounded-full object-cover border-4 border-white/20"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-red-400 to-purple-500 flex items-center justify-center font-bold text-2xl border-4 border-white/20 text-white">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-white text-lg">
                      <Link to={`/members/${member._id}`} className="hover:text-red-400 underline-offset-2 hover:underline transition-colors">{member.name}</Link>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm mt-1">
                      <span className={`px-2 py-1 rounded-full ${member.membership?.months >= 6 ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {member.membership ? `${member.membership.months} Month${member.membership.months > 1 ? 's' : ''}` : 'N/A'}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-300">
                        Expired
                      </span>
                      <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-300">
                        Expired on {formatDate(member.nextBillDate)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-6 mt-2 text-gray-400 text-sm">
                      <span>Email: {member.email}</span>
                      <span>Phone: {member.phone}</span>
                      <span>Last Visit: {formatDate(member.lastVisit)}</span>
                      <span>Join Date: {formatDate(member.joinDate)}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <Link 
                      to={`/members/${member._id}`}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow transition-all"
                    >
                      View Details
                    </Link>
                    <button 
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow transition-all"
                      onClick={() => {
                        window.open(`/members/${member._id}`, '_blank');
                      }}
                    >
                      Renew
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalMembers > 0 && (
              <div className="flex justify-between items-center mt-6 bg-white/10 px-4 py-3 rounded-lg">
                <div className="text-sm text-gray-400">
                  Showing <span className="font-medium">{startFrom}</span> to <span className="font-medium">{endTo}</span> of{" "}
                  <span className="font-medium">{totalMembers}</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    className={
                      "px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all" +
                      (currentPage === 1 ? " opacity-50 cursor-not-allowed" : "")
                    }
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </button>
                  <button
                    className={
                      "px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-all" +
                      (currentPage === totalPages ? " opacity-50 cursor-not-allowed" : "")
                    }
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpiredMemberships; 