import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar.jsx';
import FaceCapture from '../components/FaceCapture.jsx';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { config } from '../config/config.js';

// Utility to convert slug to display name
function slugToName(slug) {
  if (!slug) return '';
  // Remove trailing numbers (timestamp)
  const noTimestamp = slug.replace(/-\d+$/, '');
  // Replace dashes with spaces and capitalize each word
  return noTimestamp
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const Attendance = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Camera state
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [recognizedMember, setRecognizedMember] = useState(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    fetchTodayAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch a reasonably large chunk – adapt backend later for dedicated endpoint
      const response = await axios.get(`${config.apiUrl}/members/get-all-members?skip=0&limit=1000`, {
        withCredentials: true,
      });

      if (!response.data.success) {
        setError(response.data.message || 'Failed to fetch members');
        return;
      }

      const allMembers = response.data.members || [];
      // Compare only the date portion (ignore time)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayAttendees = allMembers.filter((m) => {
        if (!m.lastVisit) return false;
        const visit = new Date(m.lastVisit);
        visit.setHours(0, 0, 0, 0);
        return visit.getTime() === today.getTime();
      });

      setMembers(todayAttendees);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to fetch attendance data');
      toast.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------
     Camera controls – placeholders only.
     Integrate actual face-recognition logic later.
  ------------------------------------------------------*/
  const startCamera = () => {
    setIsCameraOn(true);
    // The FaceCapture component handles webcam stream internally
  };

  const stopCamera = () => {
    setIsCameraOn(false);
    setRecognizedMember(null);
    // TODO: stop media tracks
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        <span className="ml-3 text-gray-400">Loading attendance...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="text-red-400 text-center">
          <p>Error: {error}</p>
          <button
            onClick={fetchTodayAttendance}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar />
      <div className="flex bg-gradient-to-br from-black via-gray-900 to-gray-800 min-h-screen">
        <div className="ml-64 w-full min-h-screen p-10 text-white overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Face Recognition Attendance</h2>
            <div className="text-yellow-400">{new Date().toLocaleDateString()}</div>
          </div>

          {/* Camera & Controls */}
          <div className="bg-white/10 p-6 rounded-xl shadow-lg border border-yellow-500/30 mb-8 flex flex-col lg:flex-row gap-8">
            {/* Camera preview placeholder */}
            <div className="flex-1 flex items-center justify-center rounded-lg">
              {isCameraOn ? (
                <FaceCapture capturing={capturing} onCapture={async (img) => {
                  setCapturing(true);
                  try {
                    const response = await axios.post(`${config.faceApiUrl}/recognize-face`, {
                      image: img, // base64 encoded image
                    }, {
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      withCredentials: true,
                    });
                
                    if (response.data.success) {
                      setRecognizedMember(response.data.member);
                      toast.success(`Marked ${response.data.member.name} present!`);
                      try {
                        const payload = response.data.member._id
                          ? { id: response.data.member._id }
                          : { name: response.data.member.name };
                        const markRes = await axios.post(
                          `${config.apiUrl}/members/mark-attendance`,
                          payload,
                          { withCredentials: true }
                        );
                        if (markRes.data.success) {
                          const memberId = markRes.data.memberId;
                          setMembers(prev => {
                            if (prev.some(m => m._id === memberId)) return prev;
                            return [
                              {
                                _id: memberId,
                                name: response.data.member.name,
                                lastVisit: response.data.member.lastVisit,
                                status: 'Active',
                                membership: null,
                                profileImage: null,
                              },
                              ...prev,
                            ];
                          });
                        }
                      } catch (markErr) {
                        console.error('Mark attendance error', markErr);
                      }
                      await fetchTodayAttendance();
                    } else {
                      toast.error(response.data.message || 'Face not recognized');
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error('Failed to send image');
                  } finally {
                    setCapturing(false);
                  }
                }} />
                
              ) : (
                <div className="bg-black/40 rounded-lg border border-yellow-500/40 aspect-video min-h-[240px] w-full flex items-center justify-center">
                  <span className="text-gray-500">Camera off – click "Start" to begin</span>
                </div>
              )}
            </div>

            {/* Controls & status */}
            <div className="w-full lg:w-72 flex flex-col gap-4">
              <button
                onClick={startCamera}
                disabled={isCameraOn}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 rounded-lg text-white font-semibold shadow"
              >
                Start Camera
              </button>
              <button
                onClick={stopCamera}
                disabled={!isCameraOn}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 disabled:opacity-50 rounded-lg text-white font-semibold shadow"
              >
                Stop Camera
              </button>
              <div className="bg-white/5 p-4 rounded-lg text-sm text-gray-300">
                {recognizedMember ? (
                  <>
                    <p className="text-green-400 font-semibold">{recognizedMember.name} marked present!</p>
                    <p className="text-gray-400 text-xs mt-1">{formatDateTime(recognizedMember.lastVisit)}</p>
                  </>
                ) : (
                  <p>Place the member&rsquo;s face inside the frame to mark attendance automatically.</p>
                )}
              </div>
            </div>
          </div>

          {/* Attendance list */}
          <div className="bg-white/10 rounded-xl border border-white/20 shadow-xl p-6">
            <h3 className="text-2xl font-semibold mb-6">Today&rsquo;s Attendance <span className="text-yellow-400">({members.length})</span></h3>
            {members.length === 0 ? (
              <div className="text-gray-400 text-center py-16">No attendance records yet.</div>
            ) : (
              <div className="divide-y divide-white/10">
                {members.map((member) => (
                  <div key={member._id} className="py-4">
                    <div className="flex items-center gap-6">
                      {member.profileImage ? (
                        <img
                          src={member.profileImage}
                          alt={member.name}
                          className="w-14 h-14 rounded-full object-cover border-4 border-white/20"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-2xl border-4 border-white/20 text-white">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-white text-lg">
                          <Link to={`/members/${member._id}`} className="hover:text-yellow-400 underline-offset-2 hover:underline transition-colors">
                            {member.name}
                          </Link>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm mt-1">
                          <span className={`px-2 py-1 rounded-full ${member.membership?.months >= 6 ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                            {member.membership ? `${member.membership.months} Month${member.membership.months > 1 ? 's' : ''}` : 'N/A'}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${member.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {member.status}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-gray-700/40 text-gray-300">
                            Checked in: {formatDateTime(member.lastVisit)}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/members/${member._id}`}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold shadow transition-all"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;