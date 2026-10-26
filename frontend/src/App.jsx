import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { apiClient } from './api/client.js';
import { AuthPage } from './pages/AuthPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { EndpointsPage } from './pages/EndpointsPage.jsx';
import { LogsPage } from './pages/LogsPage.jsx';
import { SecurityPage } from './pages/SecurityPage.jsx';
import { Navbar } from './components/Navbar.jsx';
import { NavigationTabs } from './components/Sidebar.jsx';
import { EndpointModal } from './components/EndpointModal.jsx';
import { TestSimulatorModal } from './components/TestSimulatorModal.jsx';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function App() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [timeSeries, setTimeSeries] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [selectedApiId, setSelectedApiId] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Modals state
  const [isEndpointModalOpen, setIsEndpointModalOpen] = useState(false);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);

  // Fetch all dashboard data
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setDataLoading(true);

      const queryParam = selectedApiId ? `?apiId=${selectedApiId}` : '';

      const [summaryRes, seriesRes, endpointsRes, logsRes] = await Promise.all([
        apiClient.get(`/analytics/summary${queryParam}`),
        apiClient.get(`/analytics/timeseries${queryParam}`),
        apiClient.get('/endpoints'),
        apiClient.get(`/analytics/logs${queryParam}`),
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (seriesRes.success) setTimeSeries(seriesRes.data);
      if (endpointsRes.success) setEndpoints(endpointsRes.data.endpoints);
      if (logsRes.success) setRecentLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to load DevMetrics analytics:', err);
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated, selectedApiId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Initial Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <span className="text-xs font-mono text-slate-400">Initializing DevMetrics Telemetry...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated View
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-[#07090e] bg-grid-pattern text-slate-100 flex flex-col font-sans">
      {/* Top Fixed Header */}
      <Navbar
        onOpenNewEndpoint={() => setIsEndpointModalOpen(true)}
        onOpenSimulator={() => setIsSimulatorModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <NavigationTabs currentTab={currentTab} onChangeTab={setCurrentTab} />

          {selectedApiId && (
            <div className="flex items-center gap-2 text-xs bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-xl text-brand-300">
              <span>Filtered by API:</span>
              <strong className="text-white">
                {endpoints.find((e) => e._id === selectedApiId)?.name || 'Custom'}
              </strong>
              <button
                onClick={() => setSelectedApiId(null)}
                className="ml-2 hover:text-white font-bold"
              >
                ✕ Reset
              </button>
            </div>
          )}
        </div>

        {/* Tab Pages with Animated Transitions */}
        <AnimatePresence mode="wait">
          {currentTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DashboardPage
                summary={summary}
                timeSeries={timeSeries}
                endpoints={endpoints}
                recentLogs={recentLogs}
                selectedApiId={selectedApiId}
                onSelectApi={setSelectedApiId}
                loading={dataLoading}
                onNavigateEndpoints={() => setCurrentTab('endpoints')}
                onNavigateLogs={() => setCurrentTab('logs')}
              />
            </motion.div>
          )}

          {currentTab === 'endpoints' && (
            <motion.div
              key="endpoints"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <EndpointsPage
                endpoints={endpoints}
                onRefresh={fetchData}
                onOpenNewEndpoint={() => setIsEndpointModalOpen(true)}
              />
            </motion.div>
          )}

          {currentTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <LogsPage logs={recentLogs} onRefresh={fetchData} loading={dataLoading} />
            </motion.div>
          )}

          {currentTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SecurityPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <EndpointModal
        isOpen={isEndpointModalOpen}
        onClose={() => setIsEndpointModalOpen(false)}
        onCreated={() => {
          fetchData();
        }}
      />

      <TestSimulatorModal
        isOpen={isSimulatorModalOpen}
        onClose={() => setIsSimulatorModalOpen(false)}
        endpoints={endpoints}
        onLogsIngested={fetchData}
      />
    </div>
  );
}
export default App;
