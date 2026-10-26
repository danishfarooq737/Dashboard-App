import React, { useState } from 'react';
import { BentoCard } from '../components/BentoCard.jsx';
import { ShieldCheck, Lock, Terminal, Check, Copy, AlertOctagon, Key, Database, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function SecurityPage() {
  const [copiedSnippet, setCopiedSnippet] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const curlSnippet = `curl -X POST http://localhost:5000/api/v1/ingest \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: dm_live_YOUR_API_KEY_HERE" \\
  -d '{
    "endpoint": "/api/v1/payments/charge",
    "method": "POST",
    "statusCode": 200,
    "latencyMs": 95
  }'`;

  const expressMiddlewareSnippet = `// In your microservice Express app:
import axios from 'axios';

export function devMetricsMiddleware(apiKey) {
  return (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const latencyMs = Date.now() - start;
      // Fire-and-forget telemetry log
      axios.post('http://localhost:5000/api/v1/ingest', {
        endpoint: req.route?.path || req.path,
        method: req.method,
        statusCode: res.statusCode,
        latencyMs,
      }, {
        headers: { 'x-api-key': apiKey },
        timeout: 1500,
      }).catch(() => {}); // Prevent upstream app latency
    });
    next();
  };
}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Security & Architecture (Zero-Trust)</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Defense-in-depth security blueprint and real-time SDK integration examples
        </p>
      </div>

      {/* Security Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BentoCard className="space-y-3">
          <div className="p-2 w-fit rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-white">HttpOnly Cookie JWT</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            JWT session tokens are strictly stored in HttpOnly, Secure, and SameSite cookies, making them completely inaccessible to browser JavaScript (XSS immune).
          </p>
        </BentoCard>

        <BentoCard className="space-y-3">
          <div className="p-2 w-fit rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Key className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-white">SHA-256 Key Hashing</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            API keys are never stored plain-text. DevMetrics only persists cryptographic SHA-256 hashes, paired with constant-time verification against timing attacks.
          </p>
        </BentoCard>

        <BentoCard className="space-y-3">
          <div className="p-2 w-fit rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-white">OWASP Top 10 Mitigation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hardened with Helmet HTTP headers, NoSQL query injection recursive sanitation, Zod schema constraints, and express-rate-limit throttling.
          </p>
        </BentoCard>
      </div>

      {/* Ingestion Documentation Snippets */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white">Developer Ingestion Integration</h3>

        {/* cURL Ingestion */}
        <BentoCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-brand-400" />
              <span className="text-xs font-semibold text-white">Direct cURL Telemetry Ping</span>
            </div>
            <button
              onClick={() => handleCopy(curlSnippet, 'curl')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              {copiedSnippet === 'curl' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedSnippet === 'curl' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-dark-950 border border-white/5 text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed">
            {curlSnippet}
          </pre>
        </BentoCard>

        {/* Node.js Express Middleware */}
        <BentoCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold text-white">Express.js Telemetry Middleware Snippet</span>
            </div>
            <button
              onClick={() => handleCopy(expressMiddlewareSnippet, 'express')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              {copiedSnippet === 'express' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedSnippet === 'express' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-dark-950 border border-white/5 text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed">
            {expressMiddlewareSnippet}
          </pre>
        </BentoCard>
      </div>
    </div>
  );
}
