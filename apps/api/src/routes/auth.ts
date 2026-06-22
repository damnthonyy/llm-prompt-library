import { Router } from 'express';
import { loginInputSchema, registerInputSchema } from '@repo/shared';
import type { AuthResponse } from '@repo/shared';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { HttpError } from '../lib/httpError.js';
import {
  AUTH_COOKIE,
  authCookieOptions,
  clearAuthCookieOptions,
  hashPassword,
  signToken,
  toPublicUser,
  verifyPassword,
} from '../lib/auth.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter: Router = Router();

// POST /auth/register
authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password } = registerInputSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw HttpError.conflict('An account with this email already exists');
    }

    const user = await prisma.user.create({
      data: { email, passwordHash: await hashPassword(password) },
    });

    res.cookie(AUTH_COOKIE, signToken(user), authCookieOptions());
    const body: AuthResponse = { user: toPublicUser(user) };
    res.status(201).json(body);
  }),
);

// POST /auth/login
authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginInputSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    // Always run a comparison-shaped failure to avoid trivial user enumeration.
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw HttpError.unauthorized('Invalid email or password');
    }

    res.cookie(AUTH_COOKIE, signToken(user), authCookieOptions());
    const body: AuthResponse = { user: toPublicUser(user) };
    res.json(body);
  }),
);

// POST /auth/logout
authRouter.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE, clearAuthCookieOptions());
  res.status(204).end();
});

// GET /auth/me
authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      throw HttpError.unauthorized('Account no longer exists');
    }
    const body: AuthResponse = { user: toPublicUser(user) };
    res.json(body);
  }),
);
