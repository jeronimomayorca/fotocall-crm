import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Contact, CallStatus } from '../types';

interface StatsProps {
  contacts: Contact[];
}

const COLORS = {
  [CallStatus.PENDING]: '#94a3b8', // Slate 400
  [CallStatus.CALLED]: '#3b82f6', // Blue 500
  [CallStatus.NO_ANSWER]: '#f59e0b', // Amber 500
  [CallStatus.INTERESTED]: '#10b981', // Emerald 500
  [CallStatus.NOT_INTERESTED]: '#ef4444', // Red 500
  [CallStatus.CLOSED]: '#8b5cf6', // Violet 500
};

export const Stats: React.FC<StatsProps> = ({ contacts }) => {
  const data = Object.values(CallStatus).map(status => ({
    name: status.replace('_', ' '),
    value: contacts.filter(c => c.status === status).length
  })).filter(item => item.value > 0);

  const total = contacts.length;
  const pending = contacts.filter(c => c.status === CallStatus.PENDING).length;
  const completionRate = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Metric Cards */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
        <span className="text-slate-500 text-sm font-medium uppercase tracking-wide">Total Leads</span>
        <span className="text-4xl font-bold text-slate-900 mt-2">{total}</span>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
        <span className="text-slate-500 text-sm font-medium uppercase tracking-wide">Pending Calls</span>
        <span className="text-4xl font-bold text-blue-600 mt-2">{pending}</span>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden">
        <span className="text-slate-500 text-sm font-medium uppercase tracking-wide">Completion Rate</span>
        <span className="text-4xl font-bold text-emerald-600 mt-2">{completionRate}%</span>
        {/* Simple Progress Bar Background */}
        <div className="absolute bottom-0 left-0 h-1 bg-emerald-100 w-full">
           <div className="h-full bg-emerald-500" style={{ width: `${completionRate}%` }}></div>
        </div>
      </div>

      {/* Chart */}
      <div className="md:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Call Status Distribution</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name.replace(' ', '_') as CallStatus] || '#ccc'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};