import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';

let server;

async function startServer() {
  // Connect to MongoDB
  await connectDB();

  server = http.createServer(app);

  server.listen(config.port, () => {
    logger.info(`🚀 DevMetrics API Server running on port ${config.port} in ${config.nodeEnv} mode`);
    logger.info(`🔒 Security posture: Helmet active, strict CORS, NoSQL sanitized, Rate-limits enforced`);
  });
}

// Graceful shutdown handler
function gracefulShutdown(signal) {
  logger.warn(`Received ${signal}. Starting graceful shutdown sequence...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await mongoose.connection.close(false);
        logger.info('MongoDB connection closed cleanly.');
        process.exit(0);
      } catch (err) {
        logger.error('Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });

    // Force shutdown after 10 seconds timeout
    setTimeout(() => {
      logger.error('Forced shutdown due to 10s timeout expiration.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection detected:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception caught:', err);
  gracefulShutdown('uncaughtException');
});

startServer();
