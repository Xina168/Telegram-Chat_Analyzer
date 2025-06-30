
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: React.ReactNode; 
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon }) => {
  return (
    <div className="bg-slate-700 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium text-slate-300 uppercase">{title}</h3>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <p className="text-3xl font-semibold text-slate-100 mb-1">{value}</p>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
};

export default StatCard;
