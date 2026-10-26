import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from './errorHandler.js';

/**
 * Cookie options for high-security JWT storage
 */
export const JWT_COOKIE_NAME = 'devmetrics_token';

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.isProduction, // HTTPS only in production
  sameSite: config.isProduction ? 'none' : 'lax', // 'none' for cross-site Vercel <-> Render in production, 'lax' for local
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
});

/**
 * Middleware to authenticate requests via JWT stored in HttpOnly cookie or Bearer header
 */
export async function protect(req, res, next) {
  try {
    let token;

    // 1. Check HttpOnly Cookie first (Strict Zero Trust browser storage)
    if (req.cookies && req.cookies[JWT_COOKIE_NAME]) {
      token = req.cookies[JWT_COOKIE_NAME];
    }
    // 2. Fallback to Authorization Header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Unauthorized: Access denied. Please log in to proceed.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Fetch user and verify active existence
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user associated with this token no longer exists.', 401));
    }

    // Attach authenticated user to request
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Authentication failed or session expired.', 401));
  }
}
