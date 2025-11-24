import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Unit, UnitAllocation } from '../types';

interface AllocationChartProps {
  allocations: UnitAllocation[];
  units: Unit[];
  labels: {
    title: string;
    energy: string;
    reserve: string;
    capacity: string;
  };
}

export const AllocationChart: React.FC<AllocationChartProps> = ({ allocations, units, labels }) => {
  // Merge allocation data with unit metadata for the chart
  const data = allocations.map(alloc => {
    const unit = units.find(u => u.id === alloc.unitId);
    return {
      name: unit?.name || `Unit ${alloc.unitId}`,
      Energy: alloc.p,
      Reserve: alloc.r,
      Capacity: (unit?.pMax || 0) - alloc.p - alloc.r, // Remaining capacity for visualization
      pMax: unit?.pMax || 0
    };
  });

  return (
    <div className="h-[400px] w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{labels.title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" />
          <YAxis stroke="#64748b" label={{ value: 'MW', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          <Bar dataKey="Energy" stackId="a" fill="#3b82f6" name={labels.energy} radius={[0, 0, 0, 0]} />
          <Bar dataKey="Reserve" stackId="a" fill="#8b5cf6" name={labels.reserve} radius={[0, 0, 0, 0]} />
          <Bar dataKey="Capacity" stackId="a" fill="#f1f5f9" name={labels.capacity} stroke="#cbd5e1" strokeDasharray="3 3" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};