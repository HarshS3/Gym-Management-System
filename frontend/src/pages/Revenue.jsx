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
import { config } from '../config/config.js';

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
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchRevenueData();
    // initial payments fetch
    fetchPaymentRecords(1);
  }, []);

  const nextPage = () => {
    if (page * limit < total) {
      fetchPaymentRecords(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      fetchPaymentRecords(page - 1);
    }
  };

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      // ------------------------------------------
      // 1. Fetch monthly revenue data from backend
      // ------------------------------------------
      const revenueResponse = await axios.get(`${config.apiUrl}/analytics/monthly-revenue`, {
        withCredentials: true
      });

      // 2. Fetch new registrations for selected month
      const today = new Date();
      const todayMonth = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
      const newRegistrationsResponse = await axios.get(`${config.apiUrl}/members/monthly-members?month=${todayMonth}`, {
        withCredentials: true
      });
      
      // 3. Fetch all memberships to get pricing
      const membershipsResponse = await axios.get(`${config.apiUrl}/plans/get-membership`, {
        withCredentials: true
      });

      // -------------------------------------------------------
      // Calculate revenue breakdown (client-side) from new regs
      // -------------------------------------------------------
      let revenueBreakdown = [];
      let averageMembershipValue = 0;
      let newRegistrationsCount = 0;

      if (newRegistrationsResponse.data.success && membershipsResponse.data.membership) {
        const newMembers = newRegistrationsResponse.data.monthlyMembers || [];
        const memberships = membershipsResponse.data.membership;
        newRegistrationsCount = newMembers.length;

        newMembers.forEach(member => {
          const membership = memberships.find(m => m._id === member.membership?._id);
          if (membership) {
            const memberRevenue = membership.price;
            revenueBreakdown.push({
              memberName: member.name,
              membershipName: `${membership.months} Month${membership.months > 1 ? 's' : ''}`,
              amount: memberRevenue,
              joinDate: new Date(member.joinDate).toLocaleDateString()
            });
          }
        });
      }

      // -----------------------------------------------------------
      // Extract current and previous month totals from backend data
      // -----------------------------------------------------------
      let backendCurrentRevenue = 0;
      let backendPrevRevenue = 0;
      if (revenueResponse.data.success) {
        const revenueArray = revenueResponse.data.data || [];
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        const currentRecord = revenueArray.find(r => r.month === currentMonth && r.year === currentYear);
        const prevRecord = revenueArray.find(r => r.month === prevMonth && r.year === prevYear);

        backendCurrentRevenue = currentRecord?.totalRevenue || 0;
        backendPrevRevenue = prevRecord?.totalRevenue || 0;
      }

      // -------------------------------------------------
      // Choose backend figure if available, else fallback
      // -------------------------------------------------
      const finalMonthlyRevenue = backendCurrentRevenue;
      const finalPrevMonthRevenue = backendPrevRevenue;
      if (newRegistrationsCount > 0) {
        averageMembershipValue = finalMonthlyRevenue / newRegistrationsCount;
      }
      const growthPercentage = finalPrevMonthRevenue > 0 ?
        ((finalMonthlyRevenue - finalPrevMonthRevenue) / finalPrevMonthRevenue) * 100 : 0;

      setRevenueData({
        monthlyRevenue: finalMonthlyRevenue,
        newRegistrations: newRegistrationsCount,
        averageMembershipValue: averageMembershipValue,
        revenueBreakdown: revenueBreakdown,
        previousMonthRevenue: finalPrevMonthRevenue,
        growthPercentage: growthPercentage
      });
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentRecords = async (pageParam = 1) => {
    try {
      const skip = (pageParam - 1) * limit;
      const { data } = await axios.get(`${config.apiUrl}/payment/records?skip=${skip}&limit=${limit}`, {
        withCredentials: true,
      });
      if (data.success) {
        if (pageParam === 1) {
          setPayments(data.payments);
        } else {
          setPayments((prev) => [...prev, ...data.payments]);
        }
        setTotal(data.total || 0);
        setPage(pageParam);
      }
    } catch (err) {
      console.error('Error fetching payment records', err);
      toast.error('Failed to load payment records');
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

          {/* Payment Logs */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FaChartLine className="text-blue-400" /> Revenue Entries
            </h2>

            {payments.length === 0 ? (
              <p className="text-gray-400">No payment records found.</p>
            ) : (
              <div className="bg-white/10 rounded-xl overflow-hidden border border-white/20">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-left">Member</th>
                      <th className="px-6 py-4 text-left">Plan</th>
                      <th className="px-6 py-4 text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {payments.map((p) => (
                      <tr key={p._id}>
                        <td className="px-6 py-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-3">{p.member?.name || '—'}</td>
                        <td className="px-6 py-3">{p.membership ? `${p.membership.months} Month` : '—'}</td>
                        <td className="px-6 py-3 text-green-400 font-semibold">{formatCurrency(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {total > limit && (
              <div className="flex justify-between items-center mt-6 bg-white/10 px-4 py-3 rounded-lg">
                <button
                  onClick={prevPage}
                  disabled={page === 1}
                  className={
                    "px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all" +
                    (page === 1 ? " opacity-50 cursor-not-allowed" : "")
                  }
                >
                  Previous
                </button>
                <span className="text-sm text-gray-400">Page {page}</span>
                <button
                  onClick={nextPage}
                  disabled={page * limit >= total}
                  className={
                    "px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-all" +
                    (page * limit >= total ? " opacity-50 cursor-not-allowed" : "")
                  }
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue; 