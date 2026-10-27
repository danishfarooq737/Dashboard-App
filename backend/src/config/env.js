import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
 nodeEnv: (process.env.NODE_ENV || 'development').toLowerCase(),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devmetrics',
  jwtSecret: process.env.JWT_SECRET || 'devmetrics_default_super_secure_jwt_secret_dev_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'devmetrics_cookie_signature_secret_key_882319238472',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  ingestRateLimitMax: parseInt(process.env.INGEST_RATE_LIMIT_MAX || '300', 10),
  isProduction: (process.env.NODE_ENV || '').toLowerCase() === 'production',
};
