import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getSuratAnalyticsTrends, getSuratCategoryDistribution } from '../../services/analyticsService';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
  const trendData = getSuratAnalyticsTrends();
  const categoryData = getSuratCategoryDistribution();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Recovery Rate & Food Rescued Trend (Area Chart) */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Surat Food Recovery & Speed Trajectory (7-Day Rolling)
            </h4>
          </div>
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            98.8% Peak Recovery
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c026d3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c026d3" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="recoveredKg"
                name="Food Rescued (kg)"
                stroke="#7c3aed"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorKg)"
              />
              <Area
                type="monotone"
                dataKey="recoveryRate"
                name="Recovery Rate (%)"
                stroke="#c026d3"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRate)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-slate-600 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
            <span>Edible Weight Rescued (kg)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-500" />
            <span>Surat Platform Recovery Rate %</span>
          </div>
        </div>
      </div>

      {/* Food Category Mix (Donut Chart) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-purple-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Surat Rescued Category Mix
            </h4>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => [`${val}%`, 'Share']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '10px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs">
          {categoryData.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span>{cat.name}</span>
              </div>
              <span className="font-bold text-slate-900">{cat.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
