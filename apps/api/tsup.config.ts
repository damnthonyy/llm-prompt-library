import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  clean: true,
  sourcemap: true,
  // Bundle the source-only internal package into the output so `node dist`
  // runs without needing @repo/shared to ship compiled JS.
  noExternal: [/^@repo\//],
});
