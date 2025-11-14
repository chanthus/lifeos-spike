import { setupTestDatabase, dropTestDatabase } from '../test-utils';

/**
 * Global setup for Vitest
 * Creates test database once per worker before all tests
 */
export async function setup() {
  console.log('🔧 Setting up test database...');
  await setupTestDatabase();
}

/**
 * Global teardown for Vitest
 * Drops test database after all tests in this worker
 */
export async function teardown() {
  console.log('🧹 Cleaning up test database...');
  await dropTestDatabase();
}
