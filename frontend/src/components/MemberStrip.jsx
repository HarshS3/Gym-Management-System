import React from 'react';
import { 
  FaCheckCircle,
  FaTimesCircle,
  FaUserEdit
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const MemberStrip = ({ member, onStatusChange }) => {
  const navigate = useNavigate();
  
  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Calculate days left until next bill date
  const calculateDaysLeft = () => {
    if (!member.nextBillDate) return 0;
    const nextBill = new Date(member.nextBillDate);
    const today = new Date();
    const diffTime = nextBill - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysLeft = calculateDaysLeft();
  
  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {member.profileImage ? (
            <img
              src={member.profileImage}
              alt={member.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
          <Link
            to={`/members/${member._id}`}
            className="font-semibold text-white hover:text-blue-400 transition-colors underline-offset-2 hover:underline"
            style={{ minWidth: 0 }}
          >
            {member.name}
          </Link>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-sm ${
          member.membership?.months >= 6 ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
        }`}>
          {member.membership ? ` ${member.membership.months} Month${member.membership.months > 1 ? 's' : ''}` : 'N/A'}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {member.status === 'Active' ? (
            <>
              <FaCheckCircle className="text-green-400" />
              <span className="text-green-400">Active</span>
            </>
          ) : (
            <>
              <FaTimesCircle className="text-red-400" />
              <span className="text-red-400">Inactive</span>
            </>
          )}
        </div>
      </td>
      <td className="px-6 py-4">{formatDate(member.joinDate)}</td>
      <td className="px-6 py-4">{formatDate(member.lastVisit)}</td>
      <td className="px-6 py-4">
        <span className={`${
          daysLeft <= 0 ? 'text-red-400' : 
          daysLeft < 30 ? 'text-yellow-400' : 'text-green-400'
        }`}>
          {daysLeft} days
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" onClick={()=>{
            navigate(`/members/${member._id}`);
          }}>
            <FaUserEdit className="text-blue-400" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default MemberStrip;
