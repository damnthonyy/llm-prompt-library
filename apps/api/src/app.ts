import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './env.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

/**
 * Build the Express application (without binding a port) so it can be reused by
 * the HTTP server and by supertest in tests.
 */
export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true, // allow the auth cookie to be sent cross-origin
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.use('/health', healthRouter);
  app.use('/auth', authRouter);

  // The prompts router is mounted in a later issue.

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
