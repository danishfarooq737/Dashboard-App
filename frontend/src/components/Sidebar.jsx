import React from 'react';
import { LayoutDashboard, KeyRound, Terminal, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export function NavigationTabs({ currentTab, onChangeTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'endpoints', label: 'API Endpoints & Keys', icon: KeyRound },
    { id: 'logs', label: 'Live Telemetry Logs', icon: Terminal },
    { id: 'security', label: 'Security & Architecture', icon: ShieldAlert },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-dark-900/90 backdrop-blur-md rounded-xl border border-white/5 w-fit">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-brand-600/30 border border-brand-500/40 rounded-lg shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className={`h-4 w-4 relative z-10 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
