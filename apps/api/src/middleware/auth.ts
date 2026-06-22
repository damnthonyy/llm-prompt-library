import type { RequestHandler } from 'express';
import { AUTH_COOKIE, verifyToken } from '../lib/auth.js';
import { HttpError } from '../lib/httpError.js';

/** Read + verify the auth cookie, attaching req.user if valid. Never throws. */
const readUser: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[AUTH_COOKIE] as string | undefined;
  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.sub, email: payload.email };
    } catch {
      // Invalid/expired token → treat as anonymous.
    }
  }
  next();
};

export const optionalAuth: RequestHandler = readUser;

/** Require a valid auth cookie; 401 otherwise. */
export const requireAuth: RequestHandler = (req, res, next) => {
  readUser(req, res, () => {
    if (!req.user) {
      next(HttpError.unauthorized('Authentication required'));
      return;
    }
    next();
  });
};
