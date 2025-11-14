import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node20',
    outDir: 'dist',
    ssr: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        /^node:.*/,
        'postgres',
        '@trpc/server',
        'cors',
        'dotenv',
        '@hono/node-server',
        'hono',
        'drizzle-orm',
        'zod',
      ],
    },
  },
});
