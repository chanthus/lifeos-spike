import { beforeAll, beforeEach, afterAll } from 'vitest';
import { testDbManager } from './utils/test-db';
import { resetDatabase } from './utils/db-reset';

beforeAll(async () => {
  console.log('🔧 Setting up test environment for worker');

  try {
    const testDb = await testDbManager.createWorkerDatabase();

    console.log(
      `✅ Test database created: ${testDb.name} (worker ${process.env.VITEST_POOL_ID ?? 'unknown'})`
    );
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error);
    throw error;
  }
}, 30000);

beforeEach(async () => {
  await resetDatabase();
}, 10000);

afterAll(() => {
  const workerId = process.env.VITEST_POOL_ID ?? '1';
  console.log(`🧹 Worker ${workerId} teardown complete`);
}, 30000);
