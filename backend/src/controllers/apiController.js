import * as apiService from '../services/apiService.js';

export async function createEndpoint(req, res, next) {
  try {
    const endpoint = await apiService.createEndpoint(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'API Endpoint registered successfully. Store your API Key now; it will not be shown again.',
      data: {
        endpoint,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEndpoints(req, res, next) {
  try {
    const endpoints = await apiService.getUserEndpoints(req.user._id);
    res.status(200).json({
      success: true,
      count: endpoints.length,
      data: {
        endpoints,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEndpointById(req, res, next) {
  try {
    const endpoint = await apiService.getEndpointById(req.user._id, req.params.id);
    res.status(200).json({
      success: true,
      data: {
        endpoint,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEndpoint(req, res, next) {
  try {
    const endpoint = await apiService.updateEndpoint(req.user._id, req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'API Endpoint updated successfully',
      data: {
        endpoint,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteEndpoint(req, res, next) {
  try {
    const result = await apiService.deleteEndpoint(req.user._id, req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

export async function regenerateApiKey(req, res, next) {
  try {
    const endpoint = await apiService.regenerateApiKey(req.user._id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'API Key regenerated successfully. Previous keys are now invalidated.',
      data: {
        endpoint,
      },
    });
  } catch (error) {
    next(error);
  }
}
