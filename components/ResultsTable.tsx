import React from 'react';
import { Unit, UnitAllocation } from '../types';

interface ResultsTableProps {
  allocations: UnitAllocation[];
  units: Unit[];
  labels: {
    title: string;
    unit: string;
    mc: string;
    pMax: string;
    rMax: string;
    energy: string;
    reserve: string;
    cost: string;
  };
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ allocations, units, labels }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">{labels.title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{labels.unit}</th>
              <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-slate-500 uppercase tracking-wider">{labels.mc}</th>
              <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-slate-500 uppercase tracking-wider">{labels.pMax}</th>
              <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-slate-500 uppercase tracking-wider">{labels.rMax}</th>
              <th scope="col" className="px-6 py-3 text-end text-xs font-bold text-blue-600 uppercase tracking-wider">{labels.energy}</th>
              <th scope="col" className="px-6 py-3 text-end text-xs font-bold text-purple-600 uppercase tracking-wider">{labels.reserve}</th>
              <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-slate-500 uppercase tracking-wider">{labels.cost}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {allocations.map((alloc) => {
              const unit = units.find(u => u.id === alloc.unitId);
              if (!unit) return null;
              return (
                <tr key={alloc.unitId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 text-start">{unit.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-end text-slate-600">{unit.mc}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-end text-slate-600">{unit.pMax}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-end text-slate-600">{unit.rMax}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-end font-bold text-blue-700">{alloc.p.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-end font-bold text-purple-700">{alloc.r.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-end text-slate-800 font-mono">{alloc.cost.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};