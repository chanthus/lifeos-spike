import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  dts: false,
  noExternal: [/@project\/.*/],
  external: [
    '@hono/node-server',
    'hono',
    'postgres',
    'drizzle-orm',
    'dotenv',
    'zod',
    '@trpc/server',
  ],
});
