// src/pages/DashboardPage.tsx
import React from 'react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Métrica 1</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Métrica 2</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Métrica 3</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
        </div>
      </div>
    </div>
  );
};