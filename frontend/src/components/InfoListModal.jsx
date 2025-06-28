import React from 'react';
import { FaTimes } from 'react-icons/fa';

const InfoListModal = ({ isOpen, onClose, title, items, renderItem }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl w-full max-w-lg border border-white/20 shadow-xl">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>
          <div className="divide-y divide-white/10">
            {items && items.length > 0 ? (
              items.map((item, idx) => (
                <div key={item.id || idx} className="py-4">
                  {renderItem ? renderItem(item) : (
                    <div className="text-white">{JSON.stringify(item)}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-400 py-8 text-center">No records found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoListModal; 