import React, { useState } from 'react';
import { BentoCard } from './BentoCard.jsx';
import { StatusBadge } from './StatusBadge.jsx';
import { Server, ExternalLink, Copy, Check, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function ApiListWidget({
  endpoints = [],
  selectedApiId,
  onSelectApi,
  onNavigateEndpoints,
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <BentoCard className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Server className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Registered Microservices</h3>
            <p className="text-xs text-slate-400">Cluster health & active endpoints</p>
          </div>
        </div>
        <button
          onClick={onNavigateEndpoints}
          className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium"
        >
          Manage All &rarr;
        </button>
      </div>

      <div className="space-y-2.5 overflow-y-auto max-h-64 pr-1">
        {/* 'All Services' Filter Pill */}
        <div
          onClick={() => onSelectApi(null)}
          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedApiId === null
              ? 'bg-brand-600/15 border-brand-500/40 text-white'
              : 'bg-dark-900/60 border-white/5 text-slate-300 hover:border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-brand-400" />
            <span className="text-xs font-semibold">Aggregated Cluster (All APIs)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-dark-800 px-2 py-0.5 rounded border border-white/5">
            {endpoints.length} Active
          </span>
        </div>

        {endpoints.map((ep) => {
          const isSelected = selectedApiId === ep._id;

          return (
            <motion.div
              key={ep._id}
              whileHover={{ x: 2 }}
              onClick={() => onSelectApi(ep._id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand-600/15 border-brand-500/40 text-white shadow-sm'
                  : 'bg-dark-900/60 border-white/5 text-slate-300 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs font-semibold text-white truncate">{ep.name}</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-dark-800 text-slate-400 border border-white/5">
                    {ep.environment}
                  </span>
                </div>
                <StatusBadge status={ep.status} size="sm" />
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px]">
                <span className="text-slate-500 font-mono truncate max-w-[170px]">{ep.targetUrl}</span>
                <button
                  onClick={(e) => handleCopy(e, ep.maskedKey, ep._id)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors ml-2"
                  title="Copy Key Prefix"
                >
                  {copiedId === ep._id ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span className="font-mono text-[10px]">{ep.maskedKey?.slice(-6) || 'Key'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </BentoCard>
  );
}
