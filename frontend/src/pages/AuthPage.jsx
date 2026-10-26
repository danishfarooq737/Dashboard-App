import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, Lock, Mail, User, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export function AuthPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setIsRegister(false);
    setEmail('alex@devmetrics.io');
    setPassword('Password123!');
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#07090e] bg-grid-pattern relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bento-card rounded-3xl p-8 border border-white/10 relative z-10 shadow-2xl"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-glow mb-4">
            <div className="h-full w-full bg-dark-950 rounded-[14px] flex items-center justify-center">
              <Activity className="h-6 w-6 text-brand-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">DF DevMetrics</h1>
          <p className="text-xs text-slate-400 mt-1">Zero-Trust Telemetry & API Performance Observability</p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-dark-950 rounded-xl border border-white/5 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              !isRegister ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              isRegister ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2 overflow-hidden"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Developer Name</label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Corporate Email</label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                required
                placeholder="alex@devmetrics.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-brand-500 hover:brightness-110 text-white shadow-glow disabled:opacity-50 flex items-center justify-center gap-2 transition-all mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{isRegister ? 'Register Developer Account' : 'Authenticate Session'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo One-Click Autofill */}
        <div className="mt-6 pt-5 border-t border-white/5 flex flex-col items-center">
          <p className="text-[11px] text-slate-400 mb-2">Evaluating as a reviewer or manager?</p>
          <button
            type="button"
            onClick={handleFillDemo}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/5 text-xs text-brand-300 font-medium transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
            <span>Autofill Demo Credentials (Alex Rivera)</span>
          </button>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <Shield className="h-3 w-3 text-emerald-500" />
          <span>Secured via HttpOnly JWT Cookie & OWASP Top 10 Mitigation</span>
        </div>
      </motion.div>
    </div>
  );
}
