import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar.jsx';
import { 
  FaMoneyBillWave, 
  FaChartLine, 
  FaUsers, 
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaDollarSign
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Revenue = () => {
  const [revenueData, setRevenueData] = useState({
    monthlyRevenue: 0,
    newRegistrations: 0,
    averageMembershipValue: 0,
    revenueBreakdown: [],
    previousMonthRevenue: 0,
    growthPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

  useEffect(() => {
    fetchRevenueData();
  }, [selectedMonth]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      // Fetch new registrations for selected month
      const newRegistrationsResponse = await axios.get('http://localhost:5000/members/monthly-members', {
        withCredentials: true
      });
      
      // Fetch all memberships to get pricing
      const membershipsResponse = await axios.get('http://localhost:5000/plans/get-membership', {
        withCredentials: true
      });

      if (newRegistrationsResponse.data.success && membershipsResponse.data.membership) {
        const newMembers = newRegistrationsResponse.data.monthlyMembers || [];
        const memberships = membershipsResponse.data.membership;
        
        // Calculate revenue breakdown
        const revenueBreakdown = [];
        let totalRevenue = 0;
        
        newMembers.forEach(member => {
          const membership = memberships.find(m => m._id === member.membership?._id);
          if (membership) {
            const memberRevenue = membership.price;
            totalRevenue += memberRevenue;
            
            revenueBreakdown.push({
              memberName: member.name,
              membershipName: `${membership.months} Month${membership.months > 1 ? 's' : ''}`,
              amount: memberRevenue,
              joinDate: new Date(member.joinDate).toLocaleDateString()
            });
          }
        });

        // Calculate average membership value
        const averageMembershipValue = newMembers.length > 0 ? totalRevenue / newMembers.length : 0;

        // Mock previous month data (in real app, you'd fetch this)
        const previousMonthRevenue = totalRevenue * 0.85; // 15% less for demo
        const growthPercentage = previousMonthRevenue > 0 ? 
          ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;

        setRevenueData({
          monthlyRevenue: totalRevenue,
          newRegistrations: newMembers.length,
          averageMembershipValue: averageMembershipValue,
          revenueBreakdown: revenueBreakdown,
          previousMonthRevenue: previousMonthRevenue,
          growthPercentage: growthPercentage
        });
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Loading revenue data...</span>
      </div>
    );
  }

  return (
    <div>
      <Sidebar />
      <div className="flex bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="ml-64 w-full min-h-screen p-10 text-white overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Revenue Analytics</h1>
            <p className="text-gray-400">Track your gym's financial performance</p>
          </div>

          {/* Month Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            />
          </div>

          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 p-6 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(revenueData.monthlyRevenue)}</p>
                </div>
                <FaMoneyBillWave className="text-3xl text-green-400" />
              </div>
              <div className="flex items-center mt-2">
                {revenueData.growthPercentage >= 0 ? (
                  <FaArrowUp className="text-green-400 mr-1" />
                ) : (
                  <FaArrowDown className="text-red-400 mr-1" />
                )}
                <span className={`text-sm ${revenueData.growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(revenueData.growthPercentage).toFixed(1)}% vs last month
                </span>
              </div>
            </div>

            <div className="bg-white/10 p-6 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">New Registrations</p>
                  <p className="text-2xl font-bold text-blue-400">{revenueData.newRegistrations}</p>
                </div>
                <FaUsers className="text-3xl text-blue-400" />
              </div>
            </div>

            <div className="bg-white/10 p-6 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Average Membership</p>
                  <p className="text-2xl font-bold text-purple-400">{formatCurrency(revenueData.averageMembershipValue)}</p>
                </div>
                <FaDollarSign className="text-3xl text-purple-400" />
              </div>
            </div>

            <div className="bg-white/10 p-6 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Previous Month</p>
                  <p className="text-2xl font-bold text-yellow-400">{formatCurrency(revenueData.previousMonthRevenue)}</p>
                </div>
                <FaCalendarAlt className="text-3xl text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white/10 rounded-xl border border-white/10 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-4 border-b border-white/10">
              <h2 className="text-xl font-bold">Revenue Breakdown</h2>
              <p className="text-gray-400 text-sm">Detailed breakdown of revenue from new registrations</p>
            </div>
            <div className="p-6">
              {revenueData.revenueBreakdown.length === 0 ? (
                <div className="text-center py-8">
                  <FaChartLine className="text-4xl text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No revenue data for selected month</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {revenueData.revenueBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{item.memberName}</h3>
                          <p className="text-sm text-gray-400">{item.membershipName} • Joined: {item.joinDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">{formatCurrency(item.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Revenue Chart Placeholder */}
          <div className="mt-8 bg-white/10 rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-bold mb-4">Revenue Trend</h3>
            <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FaChartLine className="text-4xl text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Revenue chart will be implemented here</p>
                <p className="text-sm text-gray-500">Monthly revenue trends and projections</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue; 