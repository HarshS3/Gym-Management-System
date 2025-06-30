import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/sidebar.jsx';
import { 
  FaDumbbell, 
  FaCog,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus
} from 'react-icons/fa';
import axios from 'axios';
import { config } from '../config/config.js';
import AddEquipmentModal from '../components/AddEquipmentModal.jsx';

const Equipment = () => {
  const [equipmentData, setEquipmentData] = useState({});
  const [isAddOpen, setIsAddOpen] = useState(false);

  const fetchEquipments = useCallback(async () => {
    try {
      const { data } = await axios.get(`${config.apiUrl}/equipment`, { withCredentials: true });
      if (data.success) {
        // Group by muscleGroup
        const grouped = {};
        data.equipments.forEach(eq => {
          if (!grouped[eq.muscleGroup]) grouped[eq.muscleGroup] = [];
          grouped[eq.muscleGroup].push(eq);
        });
        setEquipmentData(grouped);
      }
    } catch (err) {
      console.error('Error loading equipments', err);
    }
  }, []);

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Equipment Management</h1>
              <p className="text-gray-400">Track and manage all gym equipment by muscle groups</p>
            </div>
            <button onClick={()=>setIsAddOpen(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
              <FaPlus /> Add
            </button>
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
          <AddEquipmentModal isOpen={isAddOpen} onClose={()=>setIsAddOpen(false)} onAdded={fetchEquipments} />
        </div>
      </div>
    </div>
  );
};

export default Equipment; 