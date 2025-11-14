import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import {
  getDbCredentials,
  buildConnectionString,
  testDbPrefix,
} from './client';

/**
 * Create a test database name based on worker ID
 */
export const getTestDatabaseName = (): string => {
  const workerId = process.env.VITEST_POOL_ID ?? '1';
  return `${testDbPrefix}${workerId}`;
};

/**
 * Get test database URL
 * Uses shared buildConnectionString() which automatically handles VITEST_POOL_ID
 */
export const getTestDatabaseUrl = (): string => {
  const dbName = getTestDatabaseName();
  const credentials = getDbCredentials();

  console.log(
    `📊 getTestDatabaseUrl() -> ${dbName} on ${credentials.host}:${credentials.port} (VITEST_POOL_ID=${process.env.VITEST_POOL_ID})`
  );

  return buildConnectionString();
};

/**
 * Create test database
 * Uses shared getDbCredentials() for database credentials
 */
export async function createTestDatabase(): Promise<void> {
  const credentials = getDbCredentials();
  const baseDatabase = process.env.DB_NAME ?? 'postgres';

  // Connect to base database to create test database
  const baseUrl = `postgresql://${credentials.user}:${credentials.password}@${credentials.host}:${credentials.port}/${baseDatabase}`;
  const dbName = getTestDatabaseName();

  const connection = postgres(baseUrl, { max: 1 });

  try {
    // Drop database if exists
    await connection.unsafe(`DROP DATABASE IF EXISTS "${dbName}"`);
    // Create database
    await connection.unsafe(`CREATE DATABASE "${dbName}"`);
    console.log(`✅ Created test database: ${dbName}`);
  } catch (error) {
    console.error(`❌ Failed to create test database:`, error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * Drop test database
 * Uses shared getDbCredentials() for database credentials
 */
export async function dropTestDatabase(): Promise<void> {
  const credentials = getDbCredentials();
  const baseDatabase = process.env.DB_NAME ?? 'postgres';

  // Connect to base database to drop test database
  const baseUrl = `postgresql://${credentials.user}:${credentials.password}@${credentials.host}:${credentials.port}/${baseDatabase}`;
  const dbName = getTestDatabaseName();

  const connection = postgres(baseUrl, { max: 1 });

  try {
    await connection.unsafe(`DROP DATABASE IF EXISTS "${dbName}"`);
    console.log(`✅ Dropped test database: ${dbName}`);
  } catch (error) {
    console.error(`❌ Failed to drop test database:`, error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * Run migrations on test database
 * Uses actual Drizzle migration files from ./drizzle directory
 */
export async function migrateTestDatabase(): Promise<void> {
  const credentials = getDbCredentials();

  console.log(
    `🔄 Running migrations on test database: ${credentials.database}`
  );

  try {
    const { execSync } = await import('node:child_process');

    execSync(`pnpm --filter @project/db db:migrate`, {
      env: {
        ...process.env,
        DB_HOST: credentials.host,
        DB_PORT: credentials.port.toString(),
        DB_NAME: credentials.database,
        DB_USER: credentials.user,
        DB_PASSWORD: credentials.password,
      },
      stdio: 'pipe',
      timeout: 30000,
    });

    console.log(`✅ Migrated test database: ${credentials.database}`);
  } catch (error) {
    console.error(`❌ Failed to migrate test database:`, error);
    throw error;
  }
}

/**
 * Setup test database (create + migrate)
 */
export async function setupTestDatabase(): Promise<void> {
  await createTestDatabase();
  await migrateTestDatabase();
}

/**
 * Create test database client
 */
export const createTestDb = () => {
  const connectionString = getTestDatabaseUrl();
  const connection = postgres(connectionString);
  return drizzle(connection, { schema });
};

/**
 * Clear all tables in test database
 */
export async function clearTestDatabase(
  db: ReturnType<typeof createTestDb>
): Promise<void> {
  // Clear tables in reverse dependency order
  await db.delete(schema.posts);
}
