import React, { useState, useEffect } from 'react'
import Sidebar from '../components/sidebar.jsx';
import { 
  FaUsers, 
  FaDumbbell, 
  FaMoneyBillWave, 
  FaCalendarCheck, 
  FaBell, 
  FaChartLine,
  FaUserPlus,
  FaUserClock,
  FaUserCheck,
  FaUserFriends
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    newRegistrations: 0,
    expiringMemberships: 0,
    activeEquipment: 37,
    todayAttendance: 58,
    monthlyRevenue: 42500
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch total members
      const totalMembersResponse = await axios.get('http://localhost:5000/members/get-all-members?skip=0&limit=1', {
        withCredentials: true
      });
      
      // Fetch new registrations this month
      const newRegistrationsResponse = await axios.get('http://localhost:5000/members/monthly-members', {
        withCredentials: true
      });
      
      // Fetch expiring memberships
      const expiringMembershipsResponse = await axios.get('http://localhost:5000/members/expiring-in-week', {
        withCredentials: true
      });

      // Fetch all memberships to calculate revenue
      const membershipsResponse = await axios.get('http://localhost:5000/plans/get-membership', {
        withCredentials: true
      });

      // Calculate dynamic revenue
      let calculatedRevenue = 0;
      if (newRegistrationsResponse.data.success && membershipsResponse.data.membership) {
        const newMembers = newRegistrationsResponse.data.monthlyMembers || [];
        const memberships = membershipsResponse.data.membership;
        
        newMembers.forEach(member => {
          const membership = memberships.find(m => m._id === member.membership?._id);
          if (membership) {
            calculatedRevenue += membership.price;
          }
        });
      }

      setStats({
        totalMembers: totalMembersResponse.data.totalMembers || 0,
        newRegistrations: newRegistrationsResponse.data.monthlyMembersCount || 0,
        expiringMemberships: expiringMembershipsResponse.data.expiringMembersCount || 0,
        activeEquipment: 37, // Static for now
        todayAttendance: 58, // Static for now
        monthlyRevenue: calculatedRevenue
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const membershipStatus = [
    {
      status: "Active",
      count: stats.totalMembers - stats.expiringMemberships,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      icon: <FaUserCheck />
    },
    {
      status: "Expiring Soon",
      count: stats.expiringMemberships,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      icon: <FaUserClock />
    },
    {
      status: "New This Month",
      count: stats.newRegistrations,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      icon: <FaUserPlus />
    }
  ];

  return (
    <div>
      <Sidebar />
      <div className="flex bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="ml-64 w-full min-h-screen p-10 text-white overflow-y-auto">
          {/* Logo and Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">Welcome to Gym Management Dashboard</h2>
            <p className="text-gray-400 mt-2">Empower your gym operations</p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 p-6 rounded-xl shadow-lg border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer" onClick={()=>{
              navigate("/members");
            }}>
              <div className="flex flex-col items-center">
                <FaUsers className="text-4xl text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Total Members</h3>
                <p className="text-3xl font-bold text-blue-400">{loading ? '...' : stats.totalMembers}</p>
                <p className="text-sm text-gray-400 mt-2">↑ 8% this month</p>
              </div>
            </div>

            <div className="bg-white/10 p-6 rounded-xl shadow-lg border border-white/10 hover:bg-white/20 transition-all duration-300">
              <div className="flex flex-col items-center">
                <FaDumbbell className="text-4xl text-green-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Active Equipment</h3>
                <p className="text-3xl font-bold text-green-400">{stats.activeEquipment}</p>
                <p className="text-sm text-gray-400 mt-2">All functioning</p>
              </div>
            </div>

            <div className="bg-white/10 p-6 rounded-xl shadow-lg border border-white/10 hover:bg-white/20 transition-all duration-300">
              <div className="flex flex-col items-center">
                <FaCalendarCheck className="text-4xl text-yellow-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Today's Attendance</h3>
                <p className="text-3xl font-bold text-yellow-400">{stats.todayAttendance}</p>
                <p className="text-sm text-gray-400 mt-2">Peak hours: 6-8 PM</p>
              </div>
            </div>

            {/* New Registrations Card */}
            <div className="bg-white/10 p-6 rounded-xl shadow-lg border border-white/10 hover:bg-purple-900/30 transition-all duration-300 cursor-pointer" onClick={() => navigate('/new-registrations')}>
              <div className="flex flex-col items-center">
                <FaUserPlus className="text-4xl text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">New Registrations</h3>
                <p className="text-3xl font-bold text-purple-400">{loading ? '...' : stats.newRegistrations}</p>
                <p className="text-sm text-gray-400 mt-2">This Month</p>
              </div>
            </div>

            <div className="bg-white/10 p-6 rounded-xl shadow-lg border border-white/10 hover:bg-white/20 transition-all duration-300">
              <div className="flex flex-col items-center">
                <FaMoneyBillWave className="text-4xl text-green-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Revenue This Month</h3>
                <p className="text-3xl font-bold text-green-300">₹{stats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-2">↑ 12% vs last month</p>
              </div>
            </div>

            {/* Expiring Memberships Card */}
            <div className="bg-white/10 p-6 rounded-xl shadow-lg border border-white/10 hover:bg-red-900/30 transition-all duration-300 cursor-pointer" onClick={() => navigate('/expiring-memberships')}>
              <div className="flex flex-col items-center">
                <FaBell className="text-4xl text-red-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Expiring Memberships</h3>
                <p className="text-3xl font-bold text-red-400">{loading ? '...' : stats.expiringMemberships}</p>
                <p className="text-sm text-gray-400 mt-2">Next 7 Days</p>
              </div>
            </div>
          </div>

          {/* Membership Status Overview */}
          <div className="bg-white/10 p-6 rounded-xl shadow-lg border border-white/10">
            <div className="flex items-center mb-6">
              <FaUserFriends className="text-2xl text-green-400 mr-3" />
              <h3 className="text-xl font-semibold">Membership Status Overview</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {membershipStatus.map((status, index) => (
                <div key={index} className={`${status.bgColor} p-4 rounded-lg border border-white/10`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${status.bgColor} flex items-center justify-center ${status.color}`}>
                      {status.icon}
                    </div>
                    <span className={`text-2xl font-bold ${status.color}`}>{status.count}</span>
                  </div>
                  <h4 className="font-semibold text-white">{status.status}</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {status.status === "Active" && "Members with valid memberships"}
                    {status.status === "Expiring Soon" && "Memberships expiring in 7 days"}
                    {status.status === "New This Month" && "New registrations this month"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

