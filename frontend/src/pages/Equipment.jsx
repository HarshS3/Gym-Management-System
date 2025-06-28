import React from 'react';
import Sidebar from '../components/sidebar.jsx';
import { 
  FaDumbbell, 
  FaHeartbeat, 
  FaRunning, 
  FaUserFriends,
  FaCog,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const Equipment = () => {
  const equipmentData = {
    "Chest": [
      { name: "Bench Press", status: "active", location: "Main Floor", quantity: 2 },
      { name: "Incline Bench Press", status: "active", location: "Main Floor", quantity: 1 },
      { name: "Decline Bench Press", status: "maintenance", location: "Main Floor", quantity: 1 },
      { name: "Chest Fly Machine", status: "active", location: "Machine Area", quantity: 1 },
      { name: "Cable Crossover", status: "active", location: "Cable Station", quantity: 1 },
      { name: "Dumbbell Bench", status: "active", location: "Free Weight Area", quantity: 3 }
    ],
    "Back": [
      { name: "Lat Pulldown Machine", status: "active", location: "Machine Area", quantity: 2 },
      { name: "Seated Row Machine", status: "active", location: "Machine Area", quantity: 2 },
      { name: "T-Bar Row", status: "active", location: "Free Weight Area", quantity: 1 },
      { name: "Cable Row", status: "active", location: "Cable Station", quantity: 1 },
      { name: "Pull-up Bar", status: "active", location: "Functional Area", quantity: 2 },
      { name: "Assisted Pull-up Machine", status: "active", location: "Machine Area", quantity: 1 }
    ],
    "Legs": [
      { name: "Squat Rack", status: "active", location: "Powerlifting Area", quantity: 2 },
      { name: "Leg Press Machine", status: "active", location: "Machine Area", quantity: 1 },
      { name: "Leg Extension Machine", status: "active", location: "Machine Area", quantity: 1 },
      { name: "Leg Curl Machine", status: "active", location: "Machine Area", quantity: 1 },
      { name: "Hack Squat Machine", status: "maintenance", location: "Machine Area", quantity: 1 },
      { name: "Calf Raise Machine", status: "active", location: "Machine Area", quantity: 1 },
      { name: "Smith Machine", status: "active", location: "Main Floor", quantity: 1 }
    ],
    "Shoulders": [
      { name: "Shoulder Press Machine", status: "active", location: "Machine Area", quantity: 1 },
      { name: "Lateral Raise Machine", status: "active", location: "Machine Area", quantity: 1 },
      { name: "Cable Lateral Raise", status: "active", location: "Cable Station", quantity: 1 },
      { name: "Military Press Rack", status: "active", location: "Free Weight Area", quantity: 1 }
    ],
    "Arms": [
      { name: "Bicep Curl Machine", status: "active", location: "Machine Area", quantity: 1 },
      { name: "Tricep Extension Machine", status: "active", location: "Machine Area", quantity: 1 },
      { name: "Cable Bicep Curl", status: "active", location: "Cable Station", quantity: 1 },
      { name: "Cable Tricep Pushdown", status: "active", location: "Cable Station", quantity: 1 },
      { name: "Preacher Curl Bench", status: "active", location: "Free Weight Area", quantity: 1 }
    ],
    "Core": [
      { name: "Ab Crunch Machine", status: "active", location: "Machine Area", quantity: 1 },
      { name: "Roman Chair", status: "active", location: "Functional Area", quantity: 2 },
      { name: "Cable Woodchopper", status: "active", location: "Cable Station", quantity: 1 },
      { name: "Ab Wheel", status: "active", location: "Functional Area", quantity: 5 }
    ],
    "Cardio": [
      { name: "Treadmill", status: "active", location: "Cardio Area", quantity: 6 },
      { name: "Elliptical", status: "active", location: "Cardio Area", quantity: 4 },
      { name: "Stationary Bike", status: "active", location: "Cardio Area", quantity: 3 },
      { name: "Rowing Machine", status: "active", location: "Cardio Area", quantity: 2 },
      { name: "StairMaster", status: "maintenance", location: "Cardio Area", quantity: 1 }
    ],
    "Functional Training": [
      { name: "TRX Suspension Trainer", status: "active", location: "Functional Area", quantity: 3 },
      { name: "Kettlebell Set", status: "active", location: "Functional Area", quantity: 8 },
      { name: "Resistance Bands", status: "active", location: "Functional Area", quantity: 12 },
      { name: "Medicine Balls", status: "active", location: "Functional Area", quantity: 6 },
      { name: "Battle Ropes", status: "active", location: "Functional Area", quantity: 2 }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300';
      case 'maintenance':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'inactive':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="text-green-400" />;
      case 'maintenance':
        return <FaExclamationTriangle className="text-yellow-400" />;
      case 'inactive':
        return <FaCog className="text-red-400" />;
      default:
        return <FaCog className="text-gray-400" />;
    }
  };

  const totalEquipment = Object.values(equipmentData).flat().length;
  const activeEquipment = Object.values(equipmentData).flat().filter(item => item.status === 'active').length;
  const maintenanceEquipment = Object.values(equipmentData).flat().filter(item => item.status === 'maintenance').length;

  return (
    <div>
      <Sidebar />
      <div className="flex bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="ml-64 w-full min-h-screen p-10 text-white overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Equipment Management</h1>
            <p className="text-gray-400">Track and manage all gym equipment by muscle groups</p>
          </div>

          {/* Equipment Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 p-6 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Equipment</p>
                  <p className="text-2xl font-bold">{totalEquipment}</p>
                </div>
                <FaDumbbell className="text-3xl text-blue-400" />
              </div>
            </div>
            <div className="bg-white/10 p-6 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Equipment</p>
                  <p className="text-2xl font-bold text-green-400">{activeEquipment}</p>
                </div>
                <FaCheckCircle className="text-3xl text-green-400" />
              </div>
            </div>
            <div className="bg-white/10 p-6 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Under Maintenance</p>
                  <p className="text-2xl font-bold text-yellow-400">{maintenanceEquipment}</p>
                </div>
                <FaExclamationTriangle className="text-3xl text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Equipment by Muscle Groups */}
          <div className="space-y-8">
            {Object.entries(equipmentData).map(([muscleGroup, equipment]) => (
              <div key={muscleGroup} className="bg-white/10 rounded-xl border border-white/10 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 border-b border-white/10">
                  <h2 className="text-xl font-bold">{muscleGroup}</h2>
                  <p className="text-gray-400 text-sm">{equipment.length} pieces of equipment</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipment.map((item, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white">{item.name}</h3>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(item.status)}
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-gray-400">
                          <p><span className="text-gray-300">Location:</span> {item.location}</p>
                          <p><span className="text-gray-300">Quantity:</span> {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Equipment; 