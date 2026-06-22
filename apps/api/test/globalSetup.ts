import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Prepare a fresh SQLite database for the test run by applying migrations,
 * then remove it on teardown. Uses a dedicated test.db so dev data is untouched.
 */
export default function setup() {
  const apiRoot = fileURLToPath(new URL('..', import.meta.url));
  const dbFile = fileURLToPath(new URL('../prisma/test.db', import.meta.url));

  for (const f of [dbFile, `${dbFile}-journal`]) {
    if (existsSync(f)) rmSync(f);
  }

  execSync('pnpm exec prisma migrate deploy', {
    cwd: apiRoot,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });

  return () => {
    for (const f of [dbFile, `${dbFile}-journal`]) {
      if (existsSync(f)) rmSync(f);
    }
  };
}
