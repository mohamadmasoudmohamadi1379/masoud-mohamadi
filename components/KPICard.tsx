import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red';
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, unit, subtext, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]} shadow-sm transition-all duration-200 hover:shadow-md`}>
      <h3 className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        {unit && <span className="text-sm font-medium opacity-60">{unit}</span>}
      </div>
      {subtext && <p className="text-xs mt-2 opacity-80">{subtext}</p>}
    </div>
  );
};