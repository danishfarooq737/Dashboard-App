import mongoose from 'mongoose';

const metricLogSchema = new mongoose.Schema(
  {
    apiEndpoint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApiEndpoint',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      default: 'GET',
    },
    statusCode: {
      type: Number,
      required: true,
      min: 100,
      max: 599,
    },
    latencyMs: {
      type: Number,
      required: true,
      min: 0,
    },
    ip: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'unknown',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// High-performance compound indexes for time-series and endpoint filtering
metricLogSchema.index({ user: 1, timestamp: -1 });
metricLogSchema.index({ apiEndpoint: 1, timestamp: -1 });
metricLogSchema.index({ user: 1, statusCode: 1 });

export const MetricLog = mongoose.model('MetricLog', metricLogSchema);
