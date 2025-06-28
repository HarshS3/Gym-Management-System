import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar.jsx';
import MemberStrip from '../components/MemberStrip';
import AddMemberModal from '../components/AddMemberModal';
import AddMembershipModal from '../components/AddMembershipModal';
import axios from 'axios';
import { 
  FaSearch, 
  FaFilter, 
  FaUserPlus,
  FaSortAmountDown,
  FaIdCard
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddMembershipModalOpen, setIsAddMembershipModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [startFrom, setStartFrom] = useState(1);
  const [endTo, setEndTo] = useState(10);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);
  const [members,setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    fetchData();
  },[currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const skip = (currentPage - 1) * limit;
      // console.log("Fetching members with skip:", skip, "limit:", limit);
      
      const response = await axios.get(`http://localhost:5000/members/get-all-members?skip=${skip}&limit=${limit}`, {
        withCredentials: true
      });
      
      // console.log("Members response:", response.data);
      
      if (response.data.success) {
        setMembers(response.data.members || []);
        setTotalMembers(response.data.totalMembers || 0);
        
        const pages = Math.ceil((response.data.totalMembers || 0) / limit);
        setTotalPages(pages);
        
        if (response.data.totalMembers === 0) {
          setStartFrom(0);
          setEndTo(0);
        } else {
          setStartFrom(skip + 1);
          setEndTo(Math.min(skip + limit, response.data.totalMembers));
        }
      } else {
        console.error("Failed to fetch members:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  }

  const refreshMembers = () => {
    fetchData();
  };

  // Filter and sort members
  const getFilteredAndSortedMembers = () => {
    let filtered = [...members];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone?.includes(searchTerm)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      const today = new Date();
      
      filtered = filtered.filter(member => {
        const membershipEndDate = new Date(member.membership?.endDate);
        
        if (filterStatus === 'active') {
          return membershipEndDate > today;
        } else if (filterStatus === 'inactive') {
          return !member.membership?.endDate || membershipEndDate <= today;
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'name') {
        aValue = a.name || '';
        bValue = b.name || '';
      } else if (sortBy === 'date') {
        aValue = new Date(a.createdAt || 0);
        bValue = new Date(b.createdAt || 0);
      } else if (sortBy === 'status') {
        aValue = getMemberStatus(a.membership?.endDate);
        bValue = getMemberStatus(b.membership?.endDate);
      } else {
        aValue = a.name || '';
        bValue = b.name || '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      } else {
        return aValue - bValue;
      }
    });

    return filtered;
  };

  const getMemberStatus = (endDate) => {
    if (!endDate) return 'Inactive';
    
    const today = new Date();
    const end = new Date(endDate);
    
    if (end > today) return 'Active';
    return 'Inactive';
  };

  const filteredMembers = getFilteredAndSortedMembers();

  return (
    <div>
      <Sidebar />
      <div className="flex bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="ml-64 w-full min-h-screen p-10 text-white overflow-y-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold">Members Management</h2>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-all"
              >
                <FaUserPlus />
                <span>Add New Member</span>
              </button>
              <button
                onClick={() => setIsAddMembershipModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-all"
              >
                <FaIdCard />
                <span>Add Membership</span>
              </button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Search Bar */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white/10 rounded-xl overflow-hidden border border-white/20">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-400">Loading members...</span>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No members found</p>
                <p className="text-gray-500 text-sm mt-2">Add your first member using the "Add New Member" button</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-6 py-4 text-left">Name</th>
                    <th className="px-6 py-4 text-left">Plan</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Join Date</th>
                    <th className="px-6 py-4 text-left">Last Visit</th>
                    <th className="px-6 py-4 text-left">Days Left</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredMembers.map((member) => (
                      <MemberStrip key={member._id} member={member} onStatusChange={refreshMembers} />
                  ))}
                </tbody>
              </table>
            )}
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

          {/* Add Member Modal */}
          <AddMemberModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onMemberAdded={refreshMembers}
          />
          {/* Add Membership Modal */}
          <AddMembershipModal
            isOpen={isAddMembershipModalOpen}
            onClose={() => setIsAddMembershipModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default Members; 