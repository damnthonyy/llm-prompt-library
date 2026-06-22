import 'dotenv/config';
import { z } from 'zod';

/**
 * Validate and expose environment configuration once at startup.
 * Fails fast with a readable message if something required is missing.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  /** Origin allowed by CORS (the web client). */
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
  /** Prisma datasource URL (SQLite file path, resolved from the schema dir). */
  DATABASE_URL: z.string().default('file:./dev.db'),
  /** Secret used to sign JWTs. MUST be overridden in production. */
  JWT_SECRET: z.string().min(1).default('dev-insecure-secret-change-me'),
  /** JWT lifetime (e.g. "7d", "12h"). */
  JWT_EXPIRES_IN: z.string().default('7d'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  console.error(`❌ Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

if (isProd && env.JWT_SECRET === 'dev-insecure-secret-change-me') {
  console.error('❌ JWT_SECRET must be set to a strong value in production.');
  process.exit(1);
}
