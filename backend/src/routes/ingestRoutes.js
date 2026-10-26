import { Router } from 'express';
import * as ingestController from '../controllers/ingestController.js';
import { verifyApiKey } from '../middlewares/apiKeyMiddleware.js';
import { ingestLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validator.js';
import { ingestLogSchema } from '../validators/ingestValidators.js';

const router = Router();

/**
 * Public ingestion endpoint authenticated via x-api-key header
 */
router.post(
  '/',
  ingestLimiter,
  verifyApiKey,
  validate(ingestLogSchema),
  ingestController.ingestLog
);

export default router;
