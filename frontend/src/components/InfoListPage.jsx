import React from 'react';
import Sidebar from './sidebar';

const InfoListPage = ({ title, items, renderItem }) => {
  return (
    <div>
      <Sidebar />
      <div className="flex bg-gradient-to-br from-black via-gray-900 to-gray-800 min-h-screen">
        <div className="ml-64 w-full min-h-screen p-10 text-white overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
          <div className="bg-white/10 rounded-xl border border-white/20 shadow-xl p-6">
            {items && items.length > 0 ? (
              <div className="divide-y divide-white/10">
                {items.map((item, idx) => (
                  <div key={item.id || idx} className="py-4">
                    {renderItem ? renderItem(item) : (
                      <div className="text-white">{JSON.stringify(item)}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 py-8 text-center">No records found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoListPage; 