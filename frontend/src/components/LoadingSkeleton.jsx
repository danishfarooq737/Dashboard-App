import React from 'react';

export function LoadingSkeleton({ className = '', height = 'h-6', width = 'w-full' }) {
  return (
    <div
      className={`animate-pulse bg-slate-800/60 rounded-lg ${height} ${width} ${className}`}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bento-card rounded-2xl p-5 border border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <LoadingSkeleton width="w-24" height="h-4" />
        <LoadingSkeleton width="w-8" height="h-8" className="rounded-full" />
      </div>
      <LoadingSkeleton width="w-32" height="h-8" />
      <LoadingSkeleton width="w-20" height="h-3" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bento-card rounded-2xl p-6 border border-white/5 space-y-4 h-80 flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <LoadingSkeleton width="w-40" height="h-5" />
        <LoadingSkeleton width="w-24" height="h-8" />
      </div>
      <div className="flex items-end gap-3 h-52 pt-4">
        {[40, 65, 30, 85, 55, 95, 70, 45, 80, 60, 90, 75].map((h, i) => (
          <div
            key={i}
            className="bg-slate-800/40 rounded-t w-full animate-pulse"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
