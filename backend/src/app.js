import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config/env.js';
import { noSqlSanitizer } from './middlewares/sanitize.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import { errorHandler, AppError } from './middlewares/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import ingestRoutes from './routes/ingestRoutes.js';

const app = express();

// Trust reverse proxies (Vercel, Render, AWS ALB, Cloudflare)
app.set('trust proxy', 1);

// HTTP Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", config.frontendUrl],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Strict CORS Configuration
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server ingest)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Not allowed by Access-Control-Allow-Origin'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'X-Requested-With'],
    exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  })
);

// Request body size limits to prevent DoS attacks
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser(config.cookieSecret));

// Request logging (clean format in dev, minimal in test)
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.isProduction ? 'combined' : 'dev'));
}

// OWASP NoSQL Query Injection Sanitization
app.use(noSqlSanitizer);

// Rate Limiting for general API routes
app.use('/api/', generalLimiter);

// Health check endpoint (for Render / Vercel uptime monitors)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'DF DevMetrics Backend Engine',
    uptime: process.uptime(),
  });
});

// Mount modular feature routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/endpoints', apiRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/ingest', ingestRoutes);

// Catch-all for unhandled 404 endpoints
app.use('*', (req, res, next) => {
  next(new AppError(`The requested route ${req.originalUrl} does not exist on this server.`, 404));
});

// Global Silent Error Handler
app.use(errorHandler);

export default app;
