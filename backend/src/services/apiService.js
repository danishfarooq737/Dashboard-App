import { ApiEndpoint } from '../models/ApiEndpoint.js';
import { MetricLog } from '../models/MetricLog.js';
import { generateApiKey, maskApiKey } from '../utils/cryptoUtils.js';
import { AppError } from '../middlewares/errorHandler.js';

export async function createEndpoint(userId, endpointData) {
  const { plainKey, keyHash, keyPrefix } = generateApiKey();

  const endpoint = await ApiEndpoint.create({
    user: userId,
    name: endpointData.name,
    targetUrl: endpointData.targetUrl,
    environment: endpointData.environment || 'development',
    rateLimitPerMin: endpointData.rateLimitPerMin || 60,
    keyHash,
    keyPrefix,
    status: 'live',
  });

  const endpointObj = endpoint.toJSON();
  // Provide the plain key ONLY upon creation
  return {
    ...endpointObj,
    apiKey: plainKey,
    maskedKey: maskApiKey(keyPrefix),
  };
}

export async function getUserEndpoints(userId) {
  const endpoints = await ApiEndpoint.find({ user: userId }).sort({ createdAt: -1 });

  return endpoints.map((ep) => {
    const obj = ep.toJSON();
    return {
      ...obj,
      maskedKey: maskApiKey(ep.keyPrefix),
    };
  });
}

export async function getEndpointById(userId, endpointId) {
  const endpoint = await ApiEndpoint.findOne({ _id: endpointId, user: userId });
  if (!endpoint) {
    throw new AppError('API Endpoint not found.', 404);
  }

  const obj = endpoint.toJSON();
  return {
    ...obj,
    maskedKey: maskApiKey(endpoint.keyPrefix),
  };
}

export async function updateEndpoint(userId, endpointId, updateData) {
  const endpoint = await ApiEndpoint.findOneAndUpdate(
    { _id: endpointId, user: userId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!endpoint) {
    throw new AppError('API Endpoint not found.', 404);
  }

  const obj = endpoint.toJSON();
  return {
    ...obj,
    maskedKey: maskApiKey(endpoint.keyPrefix),
  };
}

export async function deleteEndpoint(userId, endpointId) {
  const endpoint = await ApiEndpoint.findOneAndDelete({ _id: endpointId, user: userId });
  if (!endpoint) {
    throw new AppError('API Endpoint not found.', 404);
  }

  // Delete associated metric logs
  await MetricLog.deleteMany({ apiEndpoint: endpointId });

  return { message: 'API Endpoint and associated logs successfully deleted.' };
}

export async function regenerateApiKey(userId, endpointId) {
  const endpoint = await ApiEndpoint.findOne({ _id: endpointId, user: userId });
  if (!endpoint) {
    throw new AppError('API Endpoint not found.', 404);
  }

  const { plainKey, keyHash, keyPrefix } = generateApiKey();

  endpoint.keyHash = keyHash;
  endpoint.keyPrefix = keyPrefix;
  await endpoint.save();

  const obj = endpoint.toJSON();
  return {
    ...obj,
    apiKey: plainKey, // Returned plain ONCE
    maskedKey: maskApiKey(keyPrefix),
  };
}
