import React, { useState } from 'react';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { BentoCard } from '../components/BentoCard.jsx';
import { apiClient } from '../api/client.js';
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Globe,
  Sliders,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function EndpointsPage({ endpoints = [], onRefresh, onOpenNewEndpoint }) {
  const [copiedId, setCopiedId] = useState(null);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [newlyRegeneratedKey, setNewlyRegeneratedKey] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerateKey = async (endpointId) => {
    if (!window.confirm('Are you sure you want to regenerate this API Key? The previous key will stop working immediately.')) {
      return;
    }

    setRegeneratingId(endpointId);
    setError('');

    try {
      const res = await apiClient.post(`/endpoints/${endpointId}/regenerate-key`);
      if (res.success && res.data.endpoint) {
        setNewlyRegeneratedKey({
          id: endpointId,
          apiKey: res.data.endpoint.apiKey,
        });
        onRefresh && onRefresh();
      }
    } catch (err) {
      setError(err.message || 'Failed to regenerate key');
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleDeleteEndpoint = async (endpointId) => {
    if (!window.confirm('Delete this API endpoint? All associated historical metrics will be purged.')) {
      return;
    }

    setDeletingId(endpointId);
    setError('');

    try {
      await apiClient.delete(`/endpoints/${endpointId}`);
      onRefresh && onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to delete endpoint');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">API Endpoints & Key Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your registered services, generate secure credentials, and rotate API keys
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenNewEndpoint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Endpoint</span>
        </motion.button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Newly Regenerated Key Modal / Banner */}
      <AnimatePresence>
        {newlyRegeneratedKey && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                New API Key Generated! Copy Now:
              </span>
              <button
                onClick={() => setNewlyRegeneratedKey(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-dark-950 border border-amber-500/40">
              <span className="font-mono text-xs text-white select-all break-all">
                {newlyRegeneratedKey.apiKey}
              </span>
              <button
                onClick={() => handleCopy(newlyRegeneratedKey.apiKey, 'new-key')}
                className="ml-auto px-3 py-1 bg-amber-500 text-dark-950 font-bold rounded-lg text-xs shrink-0 flex items-center gap-1"
              >
                {copiedId === 'new-key' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedId === 'new-key' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Endpoints Table / Grid */}
      <div className="grid grid-cols-1 gap-4">
        {endpoints.map((ep) => (
          <BentoCard key={ep._id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">{ep.name}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-dark-800 text-slate-400 border border-white/5">
                  {ep.environment}
                </span>
                <StatusBadge status={ep.status} size="sm" />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Globe className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{ep.targetUrl}</span>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                <span>Rate Limit: {ep.rateLimitPerMin} req/min</span>
                <span>•</span>
                <span>Total Calls: {ep.totalRequestsCount?.toLocaleString() || 0}</span>
                <span>•</span>
                <span>Created: {new Date(ep.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* API Key Masked Box & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-950 border border-white/10 text-xs font-mono text-slate-300 w-full sm:w-auto justify-between sm:justify-start">
                <KeyRound className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                <span className="truncate">{ep.maskedKey}</span>
                <button
                  onClick={() => handleCopy(ep.maskedKey, ep._id)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Copy Key Prefix"
                >
                  {copiedId === ep._id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={regeneratingId === ep._id}
                  onClick={() => handleRegenerateKey(ep._id)}
                  className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 border border-white/5 transition-colors"
                  title="Regenerate API Key"
                >
                  {regeneratingId === ep._id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={deletingId === ep._id}
                  onClick={() => handleDeleteEndpoint(ep._id)}
                  className="p-2 rounded-xl bg-dark-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 border border-white/5 transition-colors"
                  title="Delete Endpoint"
                >
                  {deletingId === ep._id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </motion.button>
              </div>
            </div>
          </BentoCard>
        ))}

        {endpoints.length === 0 && (
          <div className="bento-card rounded-2xl p-10 text-center">
            <KeyRound className="h-8 w-8 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No Registered Endpoints</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Get started by registering your first microservice to generate an ingestion key.
            </p>
            <button
              onClick={onOpenNewEndpoint}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
            >
              + Register Microservice
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
