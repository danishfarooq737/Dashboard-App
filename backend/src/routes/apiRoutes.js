import { Router } from 'express';
import * as apiController from '../controllers/apiController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validator.js';
import { createApiEndpointSchema, updateApiEndpointSchema } from '../validators/apiValidators.js';

const router = Router();

// All endpoint management routes require JWT authentication
router.use(protect);

router.post('/', validate(createApiEndpointSchema), apiController.createEndpoint);
router.get('/', apiController.getEndpoints);
router.get('/:id', apiController.getEndpointById);
router.put('/:id', validate(updateApiEndpointSchema), apiController.updateEndpoint);
router.delete('/:id', apiController.deleteEndpoint);
router.post('/:id/regenerate-key', apiController.regenerateApiKey);

export default router;
