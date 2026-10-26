import React from 'react';

export function StatusBadge({ status = 'live', showLabel = true, size = 'md' }) {
  const normalized = (status || 'live').toLowerCase();

  const configs = {
    live: {
      text: 'Live',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      textColor: 'text-emerald-400',
      dotColor: 'bg-emerald-400',
      pulseColor: 'bg-emerald-500',
    },
    degraded: {
      text: 'Degraded',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      textColor: 'text-amber-400',
      dotColor: 'bg-amber-400',
      pulseColor: 'bg-amber-500',
    },
    down: {
      text: 'Down',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      textColor: 'text-rose-400',
      dotColor: 'bg-rose-400',
      pulseColor: 'bg-rose-500',
    },
  };

  const current = configs[normalized] || configs.live;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${current.bg} ${current.border} ${current.textColor} ${sizeClasses[size]}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.pulseColor}`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dotColor}`} />
      </span>
      {showLabel && <span>{current.text}</span>}
    </span>
  );
}
