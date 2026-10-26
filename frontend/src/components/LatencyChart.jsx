import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BentoCard } from './BentoCard.jsx';
import { Zap } from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-dark-900/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md">
        <p className="text-xs text-slate-400 font-mono mb-1">{data.time || label}</p>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent-cyan" />
          <span className="text-xs text-slate-300">Avg Latency:</span>
          <span className="text-sm font-bold font-mono text-white">{data.avgLatency} ms</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="h-2 w-2 rounded-full bg-brand-400" />
          <span className="text-xs text-slate-300">Total Requests:</span>
          <span className="text-xs font-semibold font-mono text-slate-200">{data.requests}</span>
        </div>
      </div>
    );
  }
  return null;
}

export function LatencyChart({ data = [] }) {
  return (
    <BentoCard className="flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Response Latency Profile</h3>
            <p className="text-xs text-slate-400">Average response duration (ms) over time</p>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-400 px-2 py-1 rounded bg-dark-800 border border-white/5">
          24h Window
        </span>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            No telemetry data recorded yet. Use the Simulator to fire mock logs.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
                tickFormatter={(v) => `${v}ms`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="avgLatency"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#latencyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </BentoCard>
  );
}
