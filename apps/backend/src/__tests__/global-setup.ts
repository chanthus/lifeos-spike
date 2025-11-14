import { TestDatabaseManager } from './utils/test-db';

export function setup(): void {
  console.log('🚀 Setting up global test environment...');
  console.log(
    '✅ Test environment setup complete (databases will be created per-worker)'
  );
}

export async function teardown(): Promise<void> {
  console.log('🧹 Tearing down test environment...');
  try {
    await TestDatabaseManager.cleanupAllDatabases();
    console.log('✅ All test databases cleaned up successfully');
  } catch (error) {
    console.error('❌ Failed to cleanup test databases:', error);
  }
  console.log('✅ Test environment teardown complete');
}
