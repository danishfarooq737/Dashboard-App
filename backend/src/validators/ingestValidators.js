import { z } from 'zod';

export const ingestLogSchema = z.object({
  endpoint: z.string().min(1, 'Endpoint path is required').max(500),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']).default('GET'),
  statusCode: z.number().int().min(100).max(599),
  latencyMs: z.number().min(0).max(120000), // Max 120s
  timestamp: z.string().datetime().optional(),
  ip: z.string().max(64).optional(),
  userAgent: z.string().max(500).optional(),
});
