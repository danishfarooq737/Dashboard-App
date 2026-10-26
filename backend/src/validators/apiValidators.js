import { z } from 'zod';

export const createApiEndpointSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  targetUrl: z.string().url('Must be a valid target URL starting with http:// or https://'),
  environment: z.enum(['production', 'staging', 'development']).default('development'),
  rateLimitPerMin: z.number().int().min(1).max(10000).optional().default(60),
});

export const updateApiEndpointSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  targetUrl: z.string().url().optional(),
  environment: z.enum(['production', 'staging', 'development']).optional(),
  status: z.enum(['live', 'degraded', 'down']).optional(),
  rateLimitPerMin: z.number().int().min(1).max(10000).optional(),
  isActive: z.boolean().optional(),
});
