import * as authService from '../services/authService.js';
import { JWT_COOKIE_NAME, getCookieOptions } from '../middlewares/authMiddleware.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.registerUser({ name, email, password });

    res.cookie(JWT_COOKIE_NAME, token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        user,
        token, // Included for clients that also use Authorization Bearer header
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });

    res.cookie(JWT_COOKIE_NAME, token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  res.clearCookie(JWT_COOKIE_NAME, getCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

export async function getMe(req, res) {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
}