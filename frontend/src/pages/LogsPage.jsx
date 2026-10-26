import React, { useState } from 'react';
import { BentoCard } from '../components/BentoCard.jsx';
import { Terminal, RefreshCw, Filter, Clock, Search, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export function LogsPage({ logs = [], onRefresh, loading }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter((log) => {
    // Filter by status group
    if (statusFilter === '2xx' && (log.statusCode < 200 || log.statusCode >= 300)) return false;
    if (statusFilter === '4xx' && (log.statusCode < 400 || log.statusCode >= 500)) return false;
    if (statusFilter === '5xx' && log.statusCode < 500) return false;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchRoute = log.endpoint.toLowerCase().includes(term);
      const matchMethod = log.method.toLowerCase().includes(term);
      const matchApi = log.apiEndpoint?.name?.toLowerCase().includes(term);
      return matchRoute || matchMethod || matchApi;
    }

    return true;
  });

  const getLatencyColor = (latency) => {
    if (latency < 120) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (latency < 400) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getStatusColor = (code) => {
    if (code >= 200 && code < 300) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (code >= 300 && code < 400) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (code >= 400 && code < 500) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Real-Time Telemetry Stream</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect individual incoming requests, status codes, and latency distributions
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-dark-800 hover:bg-dark-700 text-slate-300 border border-white/5 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bento-card rounded-2xl border border-white/5">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-dark-950 px-3 py-1.5 rounded-xl border border-white/10">
          <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search endpoint path, microservice, or method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5">
          {['all', '2xx', '4xx', '5xx'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                statusFilter === filter
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-dark-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {filter.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <BentoCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-dark-950/80 border-b border-white/5 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Method & Route</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Latency</th>
                <th className="py-3 px-4 font-semibold">Microservice</th>
                <th className="py-3 px-4 font-semibold">Client IP</th>
                <th className="py-3 px-4 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.method === 'POST'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : log.method === 'GET'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                        }`}
                      >
                        {log.method}
                      </span>
                      <span className="text-white truncate max-w-xs">{log.endpoint}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getStatusColor(
                        log.statusCode
                      )}`}
                    >
                      {log.statusCode}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${getLatencyColor(
                        log.latencyMs
                      )}`}
                    >
                      {log.latencyMs} ms
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-400">
                    <span className="truncate max-w-[140px] block font-sans text-xs">
                      {log.apiEndpoint?.name || 'General Ingest'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500">{log.ip || '127.0.0.1'}</td>

                  <td className="py-3 px-4 text-right text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans text-xs">
                    No matching telemetry logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </BentoCard>
    </div>
  );
}
