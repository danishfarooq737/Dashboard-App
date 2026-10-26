import { hashApiKey } from '../utils/cryptoUtils.js';
import { ApiEndpoint } from '../models/ApiEndpoint.js';
import { AppError } from './errorHandler.js';

/**
 * Middleware to authenticate API ingestion requests via `x-api-key` header
 */
export async function verifyApiKey(req, res, next) {
  try {
    const rawApiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!rawApiKey || typeof rawApiKey !== 'string') {
      return next(new AppError('Missing API Key. Provide a valid key in "x-api-key" header.', 401));
    }

    // Compute SHA-256 hash of provided key
    const hashedKey = hashApiKey(rawApiKey.trim());

    // Find endpoint by keyHash
    const endpoint = await ApiEndpoint.findOne({ keyHash: hashedKey, isActive: true });

    if (!endpoint) {
      return next(new AppError('Invalid, expired, or inactive API key.', 401));
    }

    // Attach to request
    req.apiEndpoint = endpoint;
    req.userId = endpoint.user;

    // Asynchronously bump lastSeenAt and total count
    ApiEndpoint.findByIdAndUpdate(endpoint._id, {
      $inc: { totalRequestsCount: 1 },
      $set: { lastSeenAt: new Date() },
    }).exec();

    next();
  } catch (error) {
    next(error);
  }
}
