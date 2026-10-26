import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middlewares/validator.js';
import { registerSchema, loginSchema } from '../validators/authValidators.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

export default router;
