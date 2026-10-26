import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

/**
 * General API Rate Limiter
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // 15 minutes
  max: config.rateLimitMaxRequests, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many requests from this IP. Please implement exponential backoff and retry later.',
    retryAfterMinutes: Math.ceil(config.rateLimitWindowMs / (60 * 1000)),
  },
});

/**
 * Strict Rate Limiter for Authentication (Brute Force Defense)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 login/register attempts per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. For your security, this IP has been temporarily rate-limited. Please wait 15 minutes before retrying.',
  },
});

/**
 * High-Throughput Rate Limiter for Metric Ingestion Endpoint
 */
export const ingestLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: config.ingestRateLimitMax, // Default 300 logs per minute per IP / Key
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per API Key if available, else per IP
    return req.headers['x-api-key'] || req.ip;
  },
  message: {
    success: false,
    error: 'Ingestion rate limit exceeded. Please buffer metric logs and retry with exponential backoff.',
    retryAfterSeconds: 60,
  },
});
