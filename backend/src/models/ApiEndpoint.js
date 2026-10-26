import mongoose from 'mongoose';

const apiEndpointSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'API name is required'],
      trim: true,
      maxlength: [120, 'API name cannot exceed 120 characters'],
    },
    targetUrl: {
      type: String,
      required: [true, 'Target URL is required'],
      trim: true,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL starting with http:// or https://'],
    },
    environment: {
      type: String,
      enum: ['production', 'staging', 'development'],
      default: 'development',
      index: true,
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    keyPrefix: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['live', 'degraded', 'down'],
      default: 'live',
      index: true,
    },
    rateLimitPerMin: {
      type: Number,
      default: 60,
      min: [1, 'Rate limit must be at least 1 request/min'],
      max: [10000, 'Rate limit cannot exceed 10000 requests/min'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalRequestsCount: {
      type: Number,
      default: 0,
    },
    lastSeenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.keyHash; // NEVER leak the key hash
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ApiEndpoint = mongoose.model('ApiEndpoint', apiEndpointSchema);
