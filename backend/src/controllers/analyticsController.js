import * as analyticsService from '../services/analyticsService.js';

export async function getSummary(req, res, next) {
  try {
    const { apiId } = req.query;
    const metrics = await analyticsService.getAggregatedMetrics(req.user._id, apiId);
    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTimeSeries(req, res, next) {
  try {
    const { apiId, hours } = req.query;
    const timeWindowHours = parseInt(hours || '24', 10);
    const series = await analyticsService.getTimeSeriesMetrics(req.user._id, apiId, timeWindowHours);
    res.status(200).json({
      success: true,
      data: series,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEndpointBreakdown(req, res, next) {
  try {
    const { apiId } = req.query;
    const breakdown = await analyticsService.getEndpointBreakdown(req.user._id, apiId);
    res.status(200).json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecentLogs(req, res, next) {
  try {
    const { apiId, limit } = req.query;
    const maxLogs = parseInt(limit || '50', 10);
    const logs = await analyticsService.getRecentLogs(req.user._id, apiId, maxLogs);
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
}
