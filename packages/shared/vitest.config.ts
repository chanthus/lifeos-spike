import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: '@project/shared',
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/test/**',
        '**/__tests__/**',
      ],
    },
  },
});
