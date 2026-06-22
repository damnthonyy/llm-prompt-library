import type { RequestHandler } from 'express';

/**
 * Wrap an async route handler so rejected promises are forwarded to Express's
 * error handling instead of crashing the process. (Native in Express 5, but we
 * target Express 4.)
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
