import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Analytics dashboard metrics require JWT authentication
router.use(protect);

router.get('/summary', analyticsController.getSummary);
router.get('/timeseries', analyticsController.getTimeSeries);
router.get('/breakdown', analyticsController.getEndpointBreakdown);
router.get('/logs', analyticsController.getRecentLogs);

export default router;
