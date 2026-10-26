import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BentoCard } from './BentoCard.jsx';
import { BarChart3 } from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-dark-900/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md">
        <p className="text-xs text-slate-400 font-mono mb-1.5">{data.time || label}</p>
        <div className="flex items-center justify-between gap-4 text-xs mb-1">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Success (2xx/3xx):
          </span>
          <span className="font-mono font-bold text-white">{data.success || 0}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Errors (4xx/5xx):
          </span>
          <span className="font-mono font-bold text-white">{data.errors || 0}</span>
        </div>
      </div>
    );
  }
  return null;
}

export function RequestVolumeChart({ data = [] }) {
  return (
    <BentoCard className="flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Request Traffic Volume</h3>
            <p className="text-xs text-slate-400">Throughput classified by HTTP status code</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-indigo-500" /> Success
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Error
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            No volume data recorded yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="success" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
              <Bar dataKey="errors" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </BentoCard>
  );
}
