import React from 'react';
import { motion } from 'framer-motion';
import { MetricCard } from '../components/MetricCard.jsx';
import { LatencyChart } from '../components/LatencyChart.jsx';
import { RequestVolumeChart } from '../components/RequestVolumeChart.jsx';
import { ApiListWidget } from '../components/ApiListWidget.jsx';
import { MetricCardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton.jsx';
import { Activity, Clock, CheckCircle, AlertTriangle, ArrowUpRight, Terminal } from 'lucide-react';

export function DashboardPage({
  summary,
  timeSeries,
  endpoints,
  recentLogs,
  selectedApiId,
  onSelectApi,
  loading,
  onNavigateEndpoints,
  onNavigateLogs,
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className="space-y-6">
      {/* Top Aggregated Metric Cards */}
      {loading && !summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={itemVariants}>
            <MetricCard
              title="TOTAL REQUESTS"
              value={summary?.totalRequests?.toLocaleString() || '0'}
              subvalue="calls"
              icon={Activity}
              trend="+14.2%"
              trendPositive={true}
              colorScheme="brand"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <MetricCard
              title="AVG LATENCY"
              value={`${summary?.avgLatencyMs || 0}`}
              subvalue="ms"
              icon={Clock}
              trend="-8.4ms"
              trendPositive={true}
              colorScheme="cyan"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <MetricCard
              title="SUCCESS RATE"
              value={`${summary?.successRate ?? 100}%`}
              subvalue="2xx/3xx"
              icon={CheckCircle}
              trend="+0.6%"
              trendPositive={true}
              colorScheme="emerald"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <MetricCard
              title="ERROR RATE"
              value={`${summary?.errorRate ?? 0}%`}
              subvalue="4xx/5xx"
              icon={AlertTriangle}
              trend={summary?.errorRate > 5 ? '+2.1%' : '-0.4%'}
              trendPositive={summary?.errorRate <= 5}
              colorScheme={summary?.errorRate > 10 ? 'rose' : 'amber'}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Bento Grid: Charts & Microservices Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Latency Profile Chart (Spans 2 columns) */}
        <div className="lg:col-span-2">
          {loading && timeSeries.length === 0 ? (
            <ChartSkeleton />
          ) : (
            <LatencyChart data={timeSeries} />
          )}
        </div>

        {/* Microservices Status Widget (Spans 1 column) */}
        <div className="lg:col-span-1">
          <ApiListWidget
            endpoints={endpoints}
            selectedApiId={selectedApiId}
            onSelectApi={onSelectApi}
            onNavigateEndpoints={onNavigateEndpoints}
          />
        </div>
      </div>

      {/* Lower Bento Grid: Request Volume & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Request Volume Stacked Bar Chart (Spans 2 cols) */}
        <div className="lg:col-span-2">
          {loading && timeSeries.length === 0 ? (
            <ChartSkeleton />
          ) : (
            <RequestVolumeChart data={timeSeries} />
          )}
        </div>

        {/* Real-time Telemetry Stream Preview */}
        <div className="lg:col-span-1 bento-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Terminal className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">Live Event Stream</h3>
              </div>
              <button
                onClick={onNavigateLogs}
                className="text-xs text-brand-400 hover:text-brand-300 font-medium"
              >
                Inspect Logs &rarr;
              </button>
            </div>

            <div className="space-y-2 mt-2">
              {recentLogs.slice(0, 5).map((log) => {
                const isError = log.statusCode >= 400;
                return (
                  <div
                    key={log._id}
                    className="p-2.5 rounded-xl bg-dark-950/70 border border-white/5 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.method === 'POST'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-cyan-500/10 text-cyan-400'
                        }`}
                      >
                        {log.method}
                      </span>
                      <span className="text-slate-300 truncate max-w-[130px]">{log.endpoint}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[11px] font-semibold ${
                          isError ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {log.statusCode}
                      </span>
                      <span className="text-slate-500 text-[10px]">{log.latencyMs}ms</span>
                    </div>
                  </div>
                );
              })}
              {recentLogs.length === 0 && (
                <p className="text-xs text-slate-500 py-6 text-center">No telemetry logs recorded yet.</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Aggregated Cluster Status:</span>
            <span className="text-emerald-400 font-medium">99.98% Uptime SLA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
