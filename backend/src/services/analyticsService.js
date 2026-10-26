import mongoose from 'mongoose';
import { MetricLog } from '../models/MetricLog.js';
import { ApiEndpoint } from '../models/ApiEndpoint.js';

/**
 * Ingest and record a metric log, dynamically calculating health status
 */
export async function recordMetricLog({ apiEndpointId, userId, logData }) {
  const log = await MetricLog.create({
    apiEndpoint: apiEndpointId,
    user: userId,
    endpoint: logData.endpoint,
    method: logData.method || 'GET',
    statusCode: logData.statusCode,
    latencyMs: logData.latencyMs,
    ip: logData.ip || '127.0.0.1',
    userAgent: logData.userAgent || 'unknown',
    timestamp: logData.timestamp ? new Date(logData.timestamp) : new Date(),
  });

  // Periodically evaluate endpoint status based on recent error frequency (last 20 requests)
  evaluateEndpointHealth(apiEndpointId).catch(() => {});

  return log;
}

/**
 * Health evaluator: Calculates recent error rate to flag live / degraded / down
 */
async function evaluateEndpointHealth(apiEndpointId) {
  const recentLogs = await MetricLog.find({ apiEndpoint: apiEndpointId })
    .sort({ timestamp: -1 })
    .limit(25)
    .select('statusCode latencyMs');

  if (recentLogs.length < 5) return;

  const total = recentLogs.length;
  const errors = recentLogs.filter((l) => l.statusCode >= 400).length;
  const errorRate = (errors / total) * 100;
  const avgLatency = recentLogs.reduce((acc, l) => acc + l.latencyMs, 0) / total;

  let newStatus = 'live';
  if (errorRate >= 50) {
    newStatus = 'down';
  } else if (errorRate >= 15 || avgLatency > 1000) {
    newStatus = 'degraded';
  }

  await ApiEndpoint.findByIdAndUpdate(apiEndpointId, { status: newStatus });
}

/**
 * Calculate aggregated summary metrics for a user across all or a specific API
 */
export async function getAggregatedMetrics(userId, apiId = null) {
  const matchStage = {
    user: new mongoose.Types.ObjectId(userId),
  };

  if (apiId) {
    matchStage.apiEndpoint = new mongoose.Types.ObjectId(apiId);
  }

  const [stats] = await MetricLog.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        avgLatency: { $avg: '$latencyMs' },
        successRequests: {
          $sum: {
            $cond: [{ $and: [{ $gte: ['$statusCode', 200] }, { $lt: ['$statusCode', 400] }] }, 1, 0],
          },
        },
        clientErrors: {
          $sum: {
            $cond: [{ $and: [{ $gte: ['$statusCode', 400] }, { $lt: ['$statusCode', 500] }] }, 1, 0],
          },
        },
        serverErrors: {
          $sum: {
            $cond: [{ $gte: ['$statusCode', 500] }, 1, 0],
          },
        },
      },
    },
  ]);

  const total = stats ? stats.totalRequests : 0;
  const avgLatency = stats ? Math.round(stats.avgLatency) : 0;
  const successRequests = stats ? stats.successRequests : 0;
  const clientErrors = stats ? stats.clientErrors : 0;
  const serverErrors = stats ? stats.serverErrors : 0;
  const totalErrors = clientErrors + serverErrors;

  const successRate = total > 0 ? parseFloat(((successRequests / total) * 100).toFixed(2)) : 100;
  const errorRate = total > 0 ? parseFloat(((totalErrors / total) * 100).toFixed(2)) : 0;

  // Active endpoints count
  const endpointsFilter = { user: userId };
  if (apiId) endpointsFilter._id = apiId;
  const totalEndpoints = await ApiEndpoint.countDocuments(endpointsFilter);
  const liveEndpoints = await ApiEndpoint.countDocuments({ ...endpointsFilter, status: 'live' });

  return {
    totalRequests: total,
    avgLatencyMs: avgLatency,
    successRate,
    errorRate,
    clientErrors,
    serverErrors,
    totalEndpoints,
    liveEndpoints,
  };
}

/**
 * Hourly/Daily time-series metrics aggregation for charts
 */
export async function getTimeSeriesMetrics(userId, apiId = null, hours = 24) {
  const matchStage = {
    user: new mongoose.Types.ObjectId(userId),
    timestamp: { $gte: new Date(Date.now() - hours * 60 * 60 * 1000) },
  };

  if (apiId) {
    matchStage.apiEndpoint = new mongoose.Types.ObjectId(apiId);
  }

  const series = await MetricLog.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' },
        },
        requests: { $sum: 1 },
        avgLatency: { $avg: '$latencyMs' },
        successCount: {
          $sum: {
            $cond: [{ $and: [{ $gte: ['$statusCode', 200] }, { $lt: ['$statusCode', 400] }] }, 1, 0],
          },
        },
        errorCount: {
          $sum: {
            $cond: [{ $gte: ['$statusCode', 400] }, 1, 0],
          },
        },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } },
  ]);

  // Format response for frontend Recharts
  return series.map((item) => {
    const d = new Date(Date.UTC(item._id.year, item._id.month - 1, item._id.day, item._id.hour));
    const timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      time: timeLabel,
      timestamp: d.toISOString(),
      requests: item.requests,
      avgLatency: Math.round(item.avgLatency),
      success: item.successCount,
      errors: item.errorCount,
    };
  });
}

/**
 * Get endpoint path breakdown
 */
export async function getEndpointBreakdown(userId, apiId = null) {
  const matchStage = {
    user: new mongoose.Types.ObjectId(userId),
  };

  if (apiId) {
    matchStage.apiEndpoint = new mongoose.Types.ObjectId(apiId);
  }

  return await MetricLog.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$endpoint',
        count: { $sum: 1 },
        avgLatency: { $avg: '$latencyMs' },
        errorCount: {
          $sum: {
            $cond: [{ $gte: ['$statusCode', 400] }, 1, 0],
          },
        },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        endpoint: '$_id',
        requests: '$count',
        avgLatency: { $round: ['$avgLatency', 0] },
        errorCount: '$errorCount',
        _id: 0,
      },
    },
  ]);
}

/**
 * Get recent raw metric logs for inspection table
 */
export async function getRecentLogs(userId, apiId = null, limit = 50) {
  const filter = { user: userId };
  if (apiId) filter.apiEndpoint = apiId;

  return await MetricLog.find(filter)
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('apiEndpoint', 'name environment')
    .lean();
}
