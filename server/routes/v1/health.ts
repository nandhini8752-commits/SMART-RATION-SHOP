import { Router, Request, Response } from 'express';
import { isDatabaseReady } from '../../db/connection';

export const healthRouter = Router();

// Process liveness check
healthRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'pass',
    service: 'srqms-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    demoMode: process.env.DEMO_MODE === 'true',
  });
});

// Database readiness check
healthRouter.get('/ready', async (_req: Request, res: Response) => {
  const dbOk = await isDatabaseReady();
  if (!dbOk) {
    return res.status(503).json({
      status: 'fail',
      service: 'srqms-api',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    status: 'pass',
    service: 'srqms-api',
    database: 'connected',
    timestamp: new Date().toISOString(),
  });
});
