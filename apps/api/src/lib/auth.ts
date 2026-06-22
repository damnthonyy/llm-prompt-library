import type { CookieOptions } from 'express';
import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { PublicUser } from '@repo/shared';
import { env, isProd } from '../env.js';

const BCRYPT_ROUNDS = 10;

/** Name of the cookie holding the auth JWT. */
export const AUTH_COOKIE = 'token';

export interface JwtPayload {
  /** User id (subject). */
  sub: string;
  email: string;
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(user: Pick<User, 'id' | 'email'>): string {
  const payload: JwtPayload = { sub: user.id, email: user.email };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === 'string' || !decoded.sub) {
    throw new Error('Invalid token payload');
  }
  return { sub: String(decoded.sub), email: String((decoded as JwtPayload).email ?? '') };
}

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
  };
}

/** Cookie options for setting the auth cookie on login/register. */
export function authCookieOptions(): CookieOptions {
  return { ...baseCookieOptions(), maxAge: 1000 * 60 * 60 * 24 * 7 }; // 7 days
}

/** Cookie options for clearing the auth cookie (no maxAge, per Express v5). */
export function clearAuthCookieOptions(): CookieOptions {
  return baseCookieOptions();
}

/** Strip sensitive fields before sending a user to the client. */
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
}
