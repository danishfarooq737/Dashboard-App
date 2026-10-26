import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '../api/client.js';
import { Play, Zap, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function TestSimulatorModal({ isOpen, onClose, endpoints = [], onLogsIngested }) {
  const [apiKey, setApiKey] = useState('');
  const [endpointPath, setEndpointPath] = useState('/api/v1/payments/process');
  const [method, setMethod] = useState('POST');
  const [statusCode, setStatusCode] = useState(200);
  const [latencyMs, setLatencyMs] = useState(85);
  const [isSimulating, setIsSimulating] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);

  if (!isOpen) return null;

  const handleSend = async (count = 1) => {
    if (!apiKey) {
      setResultMsg({ type: 'error', text: 'Please provide a valid API Key to authenticate the ingest.' });
      return;
    }

    setIsSimulating(true);
    setResultMsg(null);

    try {
      if (count === 1) {
        await apiClient.post(
          '/ingest',
          {
            endpoint: endpointPath,
            method,
            statusCode: Number(statusCode),
            latencyMs: Number(latencyMs),
          },
          {
            headers: { 'x-api-key': apiKey.trim() },
          }
        );
        setResultMsg({
          type: 'success',
          text: `Telemetry log successfully ingested! [${method} ${endpointPath} - ${statusCode} (${latencyMs}ms)]`,
        });
      } else {
        // Burst simulation of 10 requests
        const batch = Array.from({ length: 10 }).map((_, i) => ({
          endpoint: endpointPath,
          method,
          statusCode: i === 7 ? 500 : statusCode,
          latencyMs: Math.max(20, Math.floor(latencyMs + (Math.random() * 80 - 40))),
        }));

        await apiClient.post('/ingest', batch, {
          headers: { 'x-api-key': apiKey.trim() },
        });

        setResultMsg({
          type: 'success',
          text: `Burst of 10 telemetry events recorded across active cluster!`,
        });
      }

      onLogsIngested && onLogsIngested();
    } catch (err) {
      setResultMsg({
        type: 'error',
        text: err.message || 'Ingestion failed. Ensure the API Key matches an active endpoint.',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-dark-900 border border-white/10 rounded-2xl shadow-2xl p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Play className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Live Telemetry Simulator</h2>
            <p className="text-xs text-slate-400">Dispatch live HTTP events to watch dashboard charts react</p>
          </div>
        </div>

        {resultMsg && (
          <div
            className={`mb-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              resultMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            {resultMsg.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{resultMsg.text}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Active API Key (From registered endpoint)
            </label>
            <input
              type="text"
              placeholder="Paste dm_live_... key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-dark-950 border border-white/10 text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Tip: Use the key generated when creating an endpoint or check the seeded keys in the terminal.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Endpoint Path</label>
              <input
                type="text"
                value={endpointPath}
                onChange={(e) => setEndpointPath(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Status Code</label>
              <select
                value={statusCode}
                onChange={(e) => setStatusCode(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value={200}>200 OK</option>
                <option value={201}>201 Created</option>
                <option value={400}>400 Bad Request</option>
                <option value={401}>401 Unauthorized</option>
                <option value={404}>404 Not Found</option>
                <option value={500}>500 Internal Error</option>
                <option value={503}>503 Service Unavailable</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Latency: <span className="text-white font-mono">{latencyMs}ms</span>
              </label>
              <input
                type="range"
                min="10"
                max="1500"
                step="10"
                value={latencyMs}
                onChange={(e) => setLatencyMs(Number(e.target.value))}
                className="w-full accent-cyan-500 mt-2"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSimulating}
              onClick={() => handleSend(10)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-dark-800 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/10 transition-colors"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Fire Burst (10x)</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSimulating}
              onClick={() => handleSend(1)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-glow transition-all"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Send Event</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
