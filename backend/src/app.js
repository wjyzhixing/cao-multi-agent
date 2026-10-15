import express from 'express';
import { createBicycleRouter } from './bicycles/router.js';
import { BicycleRepository } from './bicycles/repository.js';
import { BicycleService } from './bicycles/service.js';

export function createApp({ repository = new BicycleRepository() } = {}) {
  const app = express();
  app.use(express.json());

  const service = new BicycleService(repository);
  app.use('/api/bicycles', createBicycleRouter(service));

  app.use((req, res) => {
    res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Request body must be valid JSON' } });
    }
    return res.status(500).json({ success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'An internal error occurred' } });
  });

  return app;
}
