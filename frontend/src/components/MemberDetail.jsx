import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config/config.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const availableMemberships = [
  { id: '1', name: 'Basic Plan', months: 1, price: 1000 },
  { id: '2', name: 'Premium Plan', months: 3, price: 2500 },
  { id: '3', name: 'Gold Plan', months: 6, price: 4500 },
  { id: '4', name: 'Platinum Plan', months: 12, price: 8000 },
];

const MemberDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberStatus, setMemberStatus] = useState('');
  const [selectedMembership, setSelectedMembership] = useState('');
  const [isRenewing, setIsRenewing] = useState(false);

  // Fetch member details
  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${config.apiUrl}/members/member-detail/${id}`, { withCredentials: true });
        if (response.data.success) {
          setMember(response.data.member);
          setMemberStatus(response.data.member.status);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to fetch member details');
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  // Handle status toggle
  const handleStatusToggle = async () => {
    if (!member) return;
    const newStatus = memberStatus === 'Active' ? 'Inactive' : 'Active';
    setMemberStatus(newStatus);
    try {
      await axios.post(`${config.apiUrl}/members/change-status/${id}`, { status: newStatus }, { withCredentials: true });
      setMember((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      setError('Error updating status');
      setMemberStatus(member.status);
    }
  };

  // Handle membership renewal
  const handleRenewMembership = async () => {
    if (!selectedMembership) {
      alert('Please select a membership plan');
      return;
    }
    setIsRenewing(true);
    try {
      await axios.put(`${config.apiUrl}/members/renew-membership/${id}`, { membershipId: selectedMembership }, { withCredentials: true });
      // Refetch member details after renewal
      const response = await axios.get(`${config.apiUrl}/members/member-detail/${id}`, { withCredentials: true });
      if (response.data.success) {
        setMember(response.data.member);
        setMemberStatus(response.data.member.status);
        setSelectedMembership('');
        alert('Membership renewed successfully!');
      }
    } catch (error) {
      setError('Failed to renew membership. Please try again.');
    } finally {
      setIsRenewing(false);
    }
  };

  // Generate PDF of member details
  const exportToPDF = () => {
    if (!member) return;

    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });

    // Title
    doc.setFontSize(22);
    doc.text(`${member.name}'s Profile`, 40, 40);

    // Basic Info table
    autoTable(doc, {
      startY: 60,
      head: [['Field', 'Value']],
      body: [
        ['Member ID', member._id],
        ['Email', member.email],
        ['Phone', member.phone],
        ['Gender', member.gender],
        ['Age', member.age],
        ['Address', member.address],
        ['Status', memberStatus],
        ['Membership', member.membership ? `${member.membership.months} month(s)` : 'N/A'],
        ['Next Bill Date', member.nextBillDate ? new Date(member.nextBillDate).toLocaleDateString() : 'N/A'],
      ],
      theme: 'grid',
      styles: { halign: 'left' },
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Health Metrics
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Health Metric', 'Value']],
      body: [
        ['Height', `${member.height} cm`],
        ['Weight', `${member.weight} kg`],
        ['BMI', member.bmi],
        ['Body Fat', member.bodyFat ? `${member.bodyFat}%` : 'N/A'],
        ['Muscle Mass', member.muscleMass ? `${member.muscleMass} kg` : 'N/A'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] },
    });

    // Body Measurements table
    const bm = member.bodyMeasurements || {};
    const bmRows = Object.entries(bm).map(([k, v]) => [k.charAt(0).toUpperCase() + k.slice(1), v ? `${v} cm` : 'N/A']);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Body Measurement', 'Value']],
      body: bmRows,
      theme: 'grid',
      headStyles: { fillColor: [142, 68, 173] },
    });

    doc.save(`${member.name.replace(/\s+/g, '_')}_profile.pdf`);
  };

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (error) return <div className="text-red-400 p-10">Error: {error}</div>;
  if (!member) return <div className="text-white p-10">No member found.</div>;

  // Helper for safe access
  const measurements = member.bodyMeasurements || {};
  const workout = member.workoutRoutine || {};
  const trainer = member.personalTrainer || {};

  // For workout split table
  const workoutSplit = [
    { day: 'Monday', focus: workout.monday || 'Rest' },
    { day: 'Tuesday', focus: workout.tuesday || 'Rest' },
    { day: 'Wednesday', focus: workout.wednesday || 'Rest' },
    { day: 'Thursday', focus: workout.thursday || 'Rest' },
    { day: 'Friday', focus: workout.friday || 'Rest' },
    { day: 'Saturday', focus: workout.saturday || 'Rest' },
    { day: 'Sunday', focus: workout.sunday || 'Rest' },
  ];

  return (
    <div>
      <Sidebar />
      <div className="flex bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="ml-64 w-full min-h-screen p-10 text-white overflow-y-auto flex flex-col items-center justify-center">
          <div className="flex w-full max-w-xl justify-between mb-8">
            <button
              className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-all"
              onClick={() => navigate('/members')}
            >
              ← Back to Members
            </button>
            <button
              className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-all"
              onClick={exportToPDF}
            >
              Export PDF
            </button>
          </div>
          <div className="bg-white/10 rounded-2xl shadow-lg border border-blue-500/30 p-10 w-full max-w-xl flex flex-col items-center">
            <div className="mb-4 text-blue-400 font-bold text-lg">Member ID: {member._id}</div>
            {member.profileImage ? (
              <img
                src={member.profileImage}
                alt={member.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20 mb-6"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center font-bold text-4xl border-4 border-white/20 mb-6 text-white">
                {member.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-center mb-6">
              <div className="font-bold text-3xl mb-2">{member.name}</div>
              <div className="flex flex-wrap gap-4 justify-center text-sm mb-2">
                <span className={`px-3 py-1 rounded-full ${member.membership?.months >= 6 ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>{member.membership ? `${member.membership.months} Month${member.membership.months > 1 ? 's' : ''}` : 'N/A'}</span>
                <span className={`px-3 py-1 rounded-full ${memberStatus === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{memberStatus}</span>
                <span className="px-3 py-1 rounded-full bg-blue-700/40 text-blue-300">Days Left: {(() => {
                  if (!member.nextBillDate) return 'N/A';
                  const nextBill = new Date(member.nextBillDate);
                  const today = new Date();
                  const diffTime = nextBill - today;
                  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                })()}</span>
              </div>
            </div>

            {/* Status Toggle Switch */}
            <div className="w-full mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Member Status</h3>
                  <p className="text-sm text-gray-400">Toggle member's active status</p>
                </div>
                <div className="flex items-center">
                  <span className={`mr-3 text-sm font-medium ${memberStatus === 'Active' ? 'text-green-400' : 'text-red-400'}`}>{memberStatus}</span>
                  <button
                    onClick={handleStatusToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${memberStatus === 'Active' ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${memberStatus === 'Active' ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Renew Membership Section - Always show */}
            <div className="w-full mb-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Renew Membership</h3>
                <p className="text-sm text-gray-400">Select a new membership plan to renew this member</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Membership Plan</label>
                  <select
                    value={selectedMembership}
                    onChange={(e) => setSelectedMembership(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-yellow-500 text-white [&>option]:bg-gray-800 [&>option]:text-white [&>option]:hover:bg-gray-700 [&>option]:focus:bg-blue-600"
                  >
                    <option value="">Choose a plan...</option>
                    {availableMemberships.map((membership) => (
                      <option key={membership.id} value={membership.id}>
                        {membership.name} - {membership.months} month(s) - ₹{membership.price}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleRenewMembership}
                  disabled={!selectedMembership || isRenewing}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${selectedMembership && !isRenewing ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                >
                  {isRenewing ? 'Renewing...' : 'Renew Membership'}
                </button>
              </div>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300 text-base mb-8">
              <div>
                <div className="font-semibold text-white">Email</div>
                <div>{member.email}</div>
              </div>
              <div>
                <div className="font-semibold text-white">Phone</div>
                <div>{member.phone}</div>
              </div>
              <div>
                <div className="font-semibold text-white">Join Date</div>
                <div>{member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div>
                <div className="font-semibold text-white">Last Visit</div>
                <div>{member.lastVisit ? new Date(member.lastVisit).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div>
                <div className="font-semibold text-white">Address</div>
                <div>{member.address}</div>
              </div>
              <div>
                <div className="font-semibold text-white">Age</div>
                <div>{member.age} yrs</div>
              </div>
              <div>
                <div className="font-semibold text-white">Gender</div>
                <div>{member.gender}</div>
              </div>
            </div>
            {/* Stats Section */}
            <div className="w-full bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 mb-4 flex flex-col gap-4 border border-blue-500/10">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-300">{member.height} cm</div>
                  <div className="text-gray-400 text-sm">Height</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-300">{member.weight} kg</div>
                  <div className="text-gray-400 text-sm">Weight</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-300">{member.bmi}</div>
                  <div className="text-gray-400 text-sm">BMI</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-pink-300">{member.bodyFat ? `${member.bodyFat}%` : 'Not recorded'}</div>
                  <div className="text-gray-400 text-sm">Body Fat</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-300">{member.muscleMass ? `${member.muscleMass} kg` : 'Not recorded'}</div>
                  <div className="text-gray-400 text-sm">Muscle Mass</div>
                </div>
              </div>
              {member.notes && (
                <div className="mt-4 text-gray-300 text-sm bg-white/5 rounded-lg p-3 border border-white/10">
                  <span className="font-semibold text-white">Notes: </span>{member.notes}
                </div>
              )}
            </div>
          </div>
          {/* Extra Details Section */}
          <div className="w-full max-w-6xl mx-auto px-4 mt-10">
            {/* Body Measurements */}
            <div className="bg-white/10 rounded-2xl shadow-lg border border-blue-500/20 p-8 mb-8">
              <h3 className="text-2xl font-bold text-blue-300 mb-6">Body Measurements</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-lg text-white">
                <div><span className="font-semibold text-blue-400">Chest:</span> {measurements.chest ? `${measurements.chest} cm` : 'Not recorded'}</div>
                <div><span className="font-semibold text-blue-400">Waist:</span> {measurements.waist ? `${measurements.waist} cm` : 'Not recorded'}</div>
                <div><span className="font-semibold text-blue-400">Hips:</span> {measurements.hips ? `${measurements.hips} cm` : 'Not recorded'}</div>
                <div><span className="font-semibold text-blue-400">Biceps:</span> {measurements.biceps ? `${measurements.biceps} cm` : 'Not recorded'}</div>
                <div><span className="font-semibold text-blue-400">Thighs:</span> {measurements.thighs ? `${measurements.thighs} cm` : 'Not recorded'}</div>
                <div><span className="font-semibold text-blue-400">Calves:</span> {measurements.calves ? `${measurements.calves} cm` : 'Not recorded'}</div>
                <div><span className="font-semibold text-blue-400">Wrist:</span> {measurements.wrist ? `${measurements.wrist} cm` : 'Not recorded'}</div>
                <div><span className="font-semibold text-blue-400">Neck:</span> {measurements.neck ? `${measurements.neck} cm` : 'Not recorded'}</div>
                <div><span className="font-semibold text-blue-400">Forearm:</span> {measurements.forearm ? `${measurements.forearm} cm` : 'Not recorded'}</div>
                <div><span className="font-semibold text-blue-400">Ankle:</span> {measurements.ankle ? `${measurements.ankle} cm` : 'Not recorded'}</div>
              </div>
              <div className="mt-4 text-sm text-gray-400 text-center">
                <p>Body measurements can be updated later when available</p>
              </div>
            </div>
            {/* Workout Routine Split */}
            <div className="bg-white/10 rounded-2xl shadow-lg border border-purple-500/20 p-8 mb-8">
              <h3 className="text-2xl font-bold text-purple-300 mb-6">Workout Routine Split</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-white">
                  <thead>
                    <tr className="bg-purple-900/30">
                      <th className="px-6 py-3 text-left text-lg font-semibold">Day</th>
                      <th className="px-6 py-3 text-left text-lg font-semibold">Focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workoutSplit.map((w, idx) => (
                      <tr key={w.day} className={idx % 2 === 0 ? 'bg-white/5' : ''}>
                        <td className="px-6 py-3">{w.day}</td>
                        <td className="px-6 py-3">{w.focus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Personal Trainer Assignment */}
            <div className="bg-white/10 rounded-2xl shadow-lg border border-green-500/20 p-8 mb-8">
              <h3 className="text-2xl font-bold text-green-300 mb-4">Personal Trainer</h3>
              {trainer.name ? (
                <div className="text-lg text-white">
                  <span className="font-semibold text-green-400">Assigned Trainer:</span> {trainer.name} <span className="text-gray-400">({trainer.phone})</span>
                </div>
              ) : (
                <div className="text-lg text-red-400 font-semibold">No trainer assigned</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;
