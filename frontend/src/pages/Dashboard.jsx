import React, { useState, useEffect } from 'react'
import Sidebar from '../components/sidebar.jsx';
import { 
  FaUsers, 
  FaDumbbell, 
  FaMoneyBillWave, 
  FaCalendarCheck, 
  FaBell, 
  FaUserPlus,
  FaUserClock,
  FaUserCheck,
  FaUserFriends,
  FaChartPie
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config/config.js';
import MembershipDistribution from '../components/analytics/MembershipDistribution';
import RevenueChart from '../components/analytics/RevenueChart';
import MembershipStatus from '../components/analytics/MembershipStatus';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    newRegistrations: 0,
    expiredMembers: 0,
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
      const totalMembersResponse = await axios.get(`${config.apiUrl}/members/get-all-members?skip=0&limit=1`, {
        withCredentials: true
      });
      
      // Fetch new registrations this month
      const newRegistrationsResponse = await axios.get(`${config.apiUrl}/members/monthly-members`, {
        withCredentials: true
      });
      
      // Fetch expired members
      const expiredMembersResponse = await axios.get(`${config.apiUrl}/members/expired-members`, {
        withCredentials: true
      });

      // Fetch membership status distribution
      const statusResponse = await axios.get(`${config.apiUrl}/analytics/membership-status`, {
        withCredentials: true
      });

      // Get active and inactive members count based on status field
      const activeCount = statusResponse.data.data.find(item => item.status === 'Active')?.count || 0;
      const inactiveCount = statusResponse.data.data.find(item => item.status === 'Inactive')?.count || 0;

      // ---------------------------------------------------------------------
      // Fetch equipment list to show active equipment count
      // ---------------------------------------------------------------------
      const equipmentResponse = await axios.get(`${config.apiUrl}/equipment`, { withCredentials: true });
      const allEquip = equipmentResponse.data.success ? equipmentResponse.data.equipments : [];
      const activeEquipCount = allEquip.filter(eq => eq.status === 'active').length;

      // ---------------------------------------------------------------------
      // Fetch monthly revenue from backend analytics to align with chart data
      // ---------------------------------------------------------------------
      const revenueResponse = await axios.get(`${config.apiUrl}/analytics/monthly-revenue`, {
        withCredentials: true
      });
      let backendMonthRevenue = 0;
      if (revenueResponse.data.success) {
        const revenueArray = revenueResponse.data.data || [];
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // JS months are 0-indexed; backend uses 1-12
        const currentYear = now.getFullYear();
        const currentRecord = revenueArray.find(r => r.month === currentMonth && r.year === currentYear);
        backendMonthRevenue = currentRecord?.totalRevenue || 0;
      }

      // Fetch all memberships to calculate revenue from new registrations (fallback)
      const membershipsResponse = await axios.get(`${config.apiUrl}/plans/get-membership`, {
        withCredentials: true
      });

      // Calculate revenue from new registrations (used if backend revenue is 0)
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

      const finalMonthlyRevenue = backendMonthRevenue || calculatedRevenue;

      // Get today attendance count by fetching all members
      const allMembersResp = await axios.get(`${config.apiUrl}/members/get-all-members?skip=0&limit=1000`, { withCredentials: true });
      let todayAttendanceCount = 0;
      if (allMembersResp.data.success) {
        const allMembers = allMembersResp.data.members || [];
        const today = new Date();
        today.setHours(0,0,0,0);
        todayAttendanceCount = allMembers.filter(m => {
          if (!m.lastVisit) return false;
          const visit = new Date(m.lastVisit);
          visit.setHours(0,0,0,0);
          return visit.getTime() === today.getTime();
        }).length;
      }

      setStats({
        totalMembers: totalMembersResponse.data.totalMembers || 0,
        activeMembers: activeCount,
        newRegistrations: newRegistrationsResponse.data.monthlyMembersCount || 0,
        expiredMembers: expiredMembersResponse.data.expiredMembersCount ?? inactiveCount,
        activeEquipment: activeEquipCount,
        todayAttendance: todayAttendanceCount,
        monthlyRevenue: finalMonthlyRevenue
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
      count: stats.activeMembers,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      icon: <FaUserCheck />
    },
    {
      status: "Expired",
      count: stats.expiredMembers,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
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

            <div className="bg-white/10 p-6 rounded-xl shadow-lg border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer" onClick={() => navigate('/equipment')}>
              <div className="flex flex-col items-center">
                <FaDumbbell className="text-4xl text-green-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Active Equipment</h3>
                <p className="text-3xl font-bold text-green-400">{stats.activeEquipment}</p>
                <p className="text-sm text-gray-400 mt-2">All functioning</p>
              </div>
            </div>

            <div className="bg-white/10 p-6 rounded-xl shadow-lg border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer" onClick={() => navigate('/attendance')}>
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

            <div className="bg-white/10 p-6 rounded-xl shadow-lg border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer" onClick={() => navigate('/revenue')}>
              <div className="flex flex-col items-center">
                <FaMoneyBillWave className="text-4xl text-green-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Revenue This Month</h3>
                <p className="text-3xl font-bold text-green-300">₹{stats.monthlyRevenue.toLocaleString()}</p>
              </div>
            </div>

            {/* Expired Memberships Card */}
            <div className="bg-white/10 p-6 rounded-xl shadow-lg border border-white/10 hover:bg-red-900/30 transition-all duration-300 cursor-pointer" onClick={() => navigate('/expired-memberships')}>
              <div className="flex flex-col items-center">
                <FaBell className="text-4xl text-red-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Expired Memberships</h3>
                <p className="text-3xl font-bold text-red-400">{loading ? '...' : stats.expiredMembers}</p>
                <p className="text-sm text-gray-400 mt-2">Need Renewal</p>
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
                    {status.status === "Expired" && "Members with expired memberships"}
                    {status.status === "New This Month" && "New registrations this month"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Section */}
          <div className="mt-8">
            <div className="flex items-center mb-6">
              <FaChartPie className="text-2xl text-purple-400 mr-3" />
              <h2 className="text-2xl font-semibold">Analytics & Insights</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MembershipDistribution />
              <MembershipStatus />
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

