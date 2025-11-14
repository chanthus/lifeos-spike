import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: '@project/backend',
    globals: true,
    environment: 'node',

    // Fork pool for parallel test execution with isolated databases
    pool: 'forks',
    poolOptions: {
      forks: {
        isolate: true,
        singleFork: false,
        minForks: 1,
        maxForks: 4,
      },
    },

    fileParallelism: true,

    globalSetup: ['./src/__tests__/global-setup.ts'],
    setupFiles: ['./src/__tests__/setup.ts'],

    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules/**', 'dist/**', 'src/__tests__/utils/**'],

    testTimeout: 10000,
    hookTimeout: 30000,

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/test/**',
        '**/__tests__/**',
      ],
    },

    reporters: ['verbose'],
  },
});
