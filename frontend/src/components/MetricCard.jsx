import React from 'react';
import { BentoCard } from './BentoCard.jsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function MetricCard({
  title,
  value,
  subvalue,
  icon: Icon,
  trend,
  trendPositive = true,
  colorScheme = 'brand',
}) {
  const colorMap = {
    brand: {
      iconBg: 'bg-brand-500/10 border-brand-500/20 text-brand-400',
      valueColor: 'text-white',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      valueColor: 'text-emerald-400',
    },
    amber: {
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      valueColor: 'text-amber-400',
    },
    rose: {
      iconBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      valueColor: 'text-rose-400',
    },
    cyan: {
      iconBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      valueColor: 'text-cyan-400',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.brand;

  return (
    <BentoCard className="flex flex-col justify-between h-36">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 tracking-wide">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${scheme.iconBg}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{value}</span>
          {subvalue && <span className="text-xs text-slate-400 font-normal">{subvalue}</span>}
        </div>

        {trend && (
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            {trendPositive ? (
              <span className="flex items-center font-medium text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                {trend}
              </span>
            ) : (
              <span className="flex items-center font-medium text-rose-400">
                <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                {trend}
              </span>
            )}
            <span className="text-slate-500 text-[11px]">vs previous window</span>
          </div>
        )}
      </div>
    </BentoCard>
  );
}
