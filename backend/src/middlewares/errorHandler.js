import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Silent Error Handler
 * Logs detailed errors server-side; returns sanitized non-descriptive error responses to clients
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // Log full error details server-side
  logger.error(`[${req.method} ${req.originalUrl}] - Status: ${statusCode} - Error: ${err.message}`, {
    stack: err.stack,
    ip: req.ip,
    headers: req.headers,
    body: req.body,
  });

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: `Duplicate entry: ${field} already exists.`,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication session. Please log in again.',
    });
  }

  // If operational error, return its user-safe message, otherwise generic error
  const clientMessage =
    err.isOperational || config.nodeEnv === 'development'
      ? err.message
      : 'An unexpected internal server error occurred. Please try again later.';

  res.status(statusCode).json({
    success: false,
    error: clientMessage,
  });
}
