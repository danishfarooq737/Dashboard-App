import * as analyticsService from '../services/analyticsService.js';

/**
 * Ingestion controller to receive single or batch API request metrics
 */
export async function ingestLog(req, res, next) {
  try {
    const apiEndpoint = req.apiEndpoint;
    const userId = req.userId;

    const payload = req.body;

    // Check if single or batch
    if (Array.isArray(payload)) {
      const logs = await Promise.all(
        payload.map((item) =>
          analyticsService.recordMetricLog({
            apiEndpointId: apiEndpoint._id,
            userId,
            logData: {
              ...item,
              ip: item.ip || req.ip,
              userAgent: item.userAgent || req.headers['user-agent'],
            },
          })
        )
      );

      return res.status(201).json({
        success: true,
        message: `${logs.length} metric logs ingested successfully`,
        count: logs.length,
      });
    }

    const log = await analyticsService.recordMetricLog({
      apiEndpointId: apiEndpoint._id,
      userId,
      logData: {
        ...payload,
        ip: payload.ip || req.ip,
        userAgent: payload.userAgent || req.headers['user-agent'],
      },
    });

    res.status(201).json({
      success: true,
      message: 'Metric log ingested successfully',
      data: {
        logId: log._id,
        apiEndpointId: apiEndpoint._id,
        timestamp: log.timestamp,
      },
    });
  } catch (error) {
    next(error);
  }
}
