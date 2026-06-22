// Augment Express's Request with the authenticated user, populated by the
// auth middleware.
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export {};
