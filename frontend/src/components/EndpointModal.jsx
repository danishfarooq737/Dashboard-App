import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../api/client.js';
import { X, Key, Copy, Check, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';

export function EndpointModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    targetUrl: '',
    environment: 'development',
    rateLimitPerMin: 60,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [newKeyData, setNewKeyData] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent duplicate submissions

    setError('');
    setSubmitting(true);

    try {
      const res = await apiClient.post('/endpoints', {
        ...formData,
        rateLimitPerMin: Number(formData.rateLimitPerMin),
      });

      if (res.success && res.data.endpoint) {
        setNewKeyData(res.data.endpoint);
        onCreated && onCreated(res.data.endpoint);
      }
    } catch (err) {
      setError(err.message || 'Failed to register API endpoint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!newKeyData?.apiKey) return;
    navigator.clipboard.writeText(newKeyData.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClose = () => {
    setNewKeyData(null);
    setFormData({ name: '', targetUrl: '', environment: 'development', rateLimitPerMin: 60 });
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-dark-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 relative"
      >
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {!newKeyData ? (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Register New API Endpoint</h2>
                <p className="text-xs text-slate-400">Generate a cryptographically secured API Key</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Microservice / API Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe Checkout Gateway"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Service Base URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://api.domain.com/v1"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 font-mono transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Deployment Environment
                  </label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Rate Limit (Req/Min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={formData.rateLimitPerMin}
                    onChange={(e) => setFormData({ ...formData, rateLimitPerMin: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-500 font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white shadow-glow transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Generating Key...</span>
                    </>
                  ) : (
                    <span>Register & Create Key</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Success Key Generation Display */
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">API Key Generated!</h2>
                <p className="text-xs text-slate-400">Save this secret key immediately</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-4 leading-relaxed">
              <strong>Security Notice:</strong> DevMetrics stores only a cryptographically hashed SHA-256 footprint of this key. For your protection, this plain API key will <strong>NEVER</strong> be displayed again.
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Your Secret Ingestion API Key
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-dark-950 border border-brand-500/40">
                <input
                  type="text"
                  readOnly
                  value={newKeyData.apiKey}
                  className="w-full bg-transparent text-white font-mono text-xs select-all focus:outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors"
            >
              I have stored my API key safely
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
