import mongoose from 'mongoose';
import { config } from './src/config/env.js';
import { User } from './src/models/User.js';
import { ApiEndpoint } from './src/models/ApiEndpoint.js';
import { MetricLog } from './src/models/MetricLog.js';
import { generateApiKey } from './src/utils/cryptoUtils.js';

async function seedDatabase() {
  console.log('🌱 Starting DF DevMetrics database seed sequence...');

  try {
    await mongoose.connect(config.mongodbUri);
    console.log(' Connected to MongoDB:', config.mongodbUri);

    // 1. Clean existing records
    console.log('🧹 Purging old collections...');
    await Promise.all([
      User.deleteMany({}),
      ApiEndpoint.deleteMany({}),
      MetricLog.deleteMany({}),
    ]);

    // 2. Create Primary Demo User
    console.log('👤 Creating demo developers...');
    const demoUser = await User.create({
      name: 'Alex Rivera',
      email: 'alex@devmetrics.io',
      password: 'Password123!',
      role: 'developer',
    });

    const adminUser = await User.create({
      name: 'Sarah Connor',
      email: 'admin@devmetrics.io',
      password: 'Password123!',
      role: 'admin',
    });

    // 3. Create Demo API Endpoints
    console.log('🔑 Generating secure API keys and registering microservices...');
    const api1Key = generateApiKey();
    const api2Key = generateApiKey();
    const api3Key = generateApiKey();

    const endpoint1 = await ApiEndpoint.create({
      user: demoUser._id,
      name: 'Stripe Payment Gateway',
      targetUrl: 'https://api.stripe.com/v1',
      environment: 'production',
      keyHash: api1Key.keyHash,
      keyPrefix: api1Key.keyPrefix,
      status: 'live',
      rateLimitPerMin: 120,
      totalRequestsCount: 92,
      lastSeenAt: new Date(),
    });

    const endpoint2 = await ApiEndpoint.create({
      user: demoUser._id,
      name: 'Auth0 Identity Microservice',
      targetUrl: 'https://identity.prod.internal/v2',
      environment: 'production',
      keyHash: api2Key.keyHash,
      keyPrefix: api2Key.keyPrefix,
      status: 'live',
      rateLimitPerMin: 300,
      totalRequestsCount: 74,
      lastSeenAt: new Date(Date.now() - 5 * 60 * 1000),
    });

    const endpoint3 = await ApiEndpoint.create({
      user: demoUser._id,
      name: 'Recommendations AI Cluster',
      targetUrl: 'https://ml.cluster.staging.io',
      environment: 'staging',
      keyHash: api3Key.keyHash,
      keyPrefix: api3Key.keyPrefix,
      status: 'degraded',
      rateLimitPerMin: 60,
      totalRequestsCount: 38,
      lastSeenAt: new Date(Date.now() - 12 * 60 * 1000),
    });

    // 4. Generate Historical Metric Logs across past 24 hours
    console.log('📊 Synthesizing 180+ real-time metric request logs...');

    const sampleRoutes = [
      { ep: '/api/v1/payments/charge', method: 'POST', endpointRef: endpoint1, baseLatency: 110 },
      { ep: '/api/v1/customers/verify', method: 'GET', endpointRef: endpoint1, baseLatency: 45 },
      { ep: '/api/v1/refunds', method: 'POST', endpointRef: endpoint1, baseLatency: 195 },
      { ep: '/oauth/token', method: 'POST', endpointRef: endpoint2, baseLatency: 60 },
      { ep: '/users/session/validate', method: 'GET', endpointRef: endpoint2, baseLatency: 28 },
      { ep: '/permissions/check', method: 'GET', endpointRef: endpoint2, baseLatency: 35 },
      { ep: '/v1/predict/feed', method: 'POST', endpointRef: endpoint3, baseLatency: 480 },
      { ep: '/v1/models/status', method: 'GET', endpointRef: endpoint3, baseLatency: 95 },
    ];

    const logs = [];
    const now = Date.now();

    // Distribute logs over past 24 hours
    for (let i = 0; i < 200; i++) {
      // random time in the last 24h
      const timeOffsetMs = Math.floor(Math.random() * (24 * 60 * 60 * 1000));
      const logTimestamp = new Date(now - timeOffsetMs);

      const route = sampleRoutes[Math.floor(Math.random() * sampleRoutes.length)];

      // Determine realistic status code (90% success, 7% 4xx, 3% 5xx)
      let statusCode = 200;
      const rand = Math.random();
      if (route.endpointRef === endpoint3 && rand > 0.7) {
        // Degraded endpoint has more errors
        statusCode = rand > 0.85 ? 503 : 504;
      } else if (rand > 0.95) {
        statusCode = 500;
      } else if (rand > 0.90) {
        statusCode = 401;
      } else if (rand > 0.85) {
        statusCode = 404;
      } else if (rand > 0.80) {
        statusCode = 400;
      } else if (rand > 0.50) {
        statusCode = 201;
      }

      // Add natural jitter to latency
      const jitter = Math.floor(Math.random() * 80) - 30;
      const latencyMs = Math.max(15, route.baseLatency + jitter + (statusCode >= 500 ? 350 : 0));

      logs.push({
        apiEndpoint: route.endpointRef._id,
        user: demoUser._id,
        endpoint: route.ep,
        method: route.method,
        statusCode,
        latencyMs,
        ip: `192.168.1.${Math.floor(Math.random() * 200) + 1}`,
        userAgent: 'DevMetrics-Client/1.0 (Axios 1.7)',
        timestamp: logTimestamp,
      });
    }

    await MetricLog.insertMany(logs);

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demo Credentials:');
    console.log('  Email:    alex@devmetrics.io');
    console.log('  Password: Password123!');
    console.log('\nGenerated Active API Keys:');
    console.log(`  [${endpoint1.name}]:\n    ${api1Key.plainKey}`);
    console.log(`  [${endpoint2.name}]:\n    ${api2Key.plainKey}`);
    console.log(`  [${endpoint3.name}]:\n    ${api3Key.plainKey}`);
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
