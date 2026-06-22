import { PrismaClient } from '@prisma/client';
import { isProd } from '../env.js';

/**
 * Single PrismaClient instance, cached on globalThis so the dev watcher
 * (tsx watch) doesn't exhaust connections by creating a new client on reload.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['error'] : ['warn', 'error'],
  });

if (!isProd) {
  globalForPrisma.prisma = prisma;
}
