import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    logger.info('Database already connected.');
    return;
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 20,
    minPoolSize: 5,
  };

  try {
    const conn = await mongoose.connect(config.mongodbUri, options);
    isConnected = true;
    logger.info(`MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error.message);
    // In production or when DB is mandatory, handle or retry
    if (config.isProduction) {
      process.exit(1);
    }
  }

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB disconnected. Reconnecting...');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB runtime error:', err);
  });
}

export function isDbConnected() {
  return isConnected;
}
