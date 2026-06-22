import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import type { ApiError } from '@repo/shared';
import { HttpError } from '../lib/httpError.js';
import { isProd } from '../env.js';

/** 404 for any unmatched route. */
export const notFoundHandler: RequestHandler = (req, res) => {
  const body: ApiError = { error: { message: `Route not found: ${req.method} ${req.path}` } };
  res.status(404).json(body);
};

/** Convert a ZodError into field-keyed details for the ApiError envelope. */
function zodDetails(err: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_';
    (details[key] ??= []).push(issue.message);
  }
  return details;
}

/**
 * Centralized error handler. Translates known error types (HttpError,
 * ZodError) into the shared ApiError shape; everything else becomes a 500.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    const body: ApiError = { error: { message: err.message, details: err.details } };
    res.status(err.status).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const body: ApiError = {
      error: { message: 'Validation failed', details: zodDetails(err) },
    };
    res.status(400).json(body);
    return;
  }

  // Unknown / unexpected error.
  if (!isProd) {
    console.error(err);
  }
  const body: ApiError = {
    error: { message: isProd ? 'Internal server error' : String((err as Error)?.message ?? err) },
  };
  res.status(500).json(body);
};
