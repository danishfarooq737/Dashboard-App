import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Activity, Plus, Play, LogOut, Terminal, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export function Navbar({ onOpenNewEndpoint, onOpenSimulator }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-[#07090e]/80 backdrop-blur-xl px-4 lg:px-8 py-3.5">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-glow flex items-center justify-center">
            <div className="h-full w-full bg-dark-950 rounded-[10px] flex items-center justify-center">
              <Activity className="h-5 w-5 text-brand-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">DevMetrics</span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold">
                SaaS v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Zero-Trust Real-Time API Observability</p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center gap-3">
          {/* Simulate Live Requests Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-800 text-slate-200 border border-white/10 hover:border-accent-cyan/40 hover:text-white transition-all shadow-sm"
            title="Simulate incoming API traffic"
          >
            <Play className="h-3.5 w-3.5 text-accent-cyan fill-accent-cyan/20" />
            <span className="hidden md:inline">Simulate Traffic</span>
          </motion.button>

          {/* Register New API Endpoint */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenNewEndpoint}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow hover:brightness-110 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Register API</span>
          </motion.button>

          {/* User Profile / Logout */}
          <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

          <div className="flex items-center gap-3 pl-1">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-medium text-slate-200">{user?.name || 'Developer'}</span>
              <span className="text-[11px] text-slate-500 font-mono">{user?.email}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="p-2 rounded-lg bg-dark-850 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 border border-white/5 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
