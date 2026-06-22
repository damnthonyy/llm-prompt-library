#!/usr/bin/env node
// One-time project bootstrap: create local env files, apply DB migrations, seed.
// Run via `pnpm bootstrap` (not `pnpm setup` — that's a reserved pnpm command).
import { copyFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const envPairs = [
  ['apps/api/.env.example', 'apps/api/.env'],
  ['apps/web/.env.example', 'apps/web/.env'],
];

for (const [src, dst] of envPairs) {
  if (existsSync(src) && !existsSync(dst)) {
    copyFileSync(src, dst);
    console.log(`📝 created ${dst}`);
  }
}

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

run('pnpm --filter @repo/api db:deploy');
run('pnpm --filter @repo/api db:seed');

console.log('\n✅ Setup complete. Start the app with: pnpm dev');
