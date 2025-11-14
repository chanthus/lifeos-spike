import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { migrate as drizzlePgMigrate } from 'drizzle-orm/postgres-js/migrator';
import { migrate as drizzleNeonMigrate } from 'drizzle-orm/neon-http/migrator';
import * as schema from './schema';

export const testDbPrefix = 'project_test_worker_';

/**
 * Get database credentials from environment variables
 * Automatically uses test database when VITEST_POOL_ID is set
 */
export function getDbCredentials() {
  const host = process.env.DB_HOST ?? 'localhost';
  const port = process.env.DB_PORT ?? '43891';
  const user = process.env.DB_USER ?? 'postgres';
  const password = process.env.DB_PASSWORD ?? 'postgres';

  const name = process.env.VITEST_POOL_ID
    ? `${testDbPrefix}${process.env.VITEST_POOL_ID}`
    : (process.env.DB_NAME ?? 'postgres');

  return {
    host,
    port: parseInt(port),
    user,
    password,
    database: name,
  };
}

/**
 * Build Postgres connection string from environment variables
 */
export function buildConnectionString(): string {
  // If DATABASE_URL is explicitly set, use it (e.g., Neon, Railway)
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Otherwise, construct from individual DB_* variables (local dev)
  const { host, port, user, password, database } = getDbCredentials();
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

/**
 * Get database connection string from environment variables
 * @deprecated Use buildConnectionString() instead
 */
export const getDatabaseUrl = buildConnectionString;

/**
 * Detect database provider from environment
 */
function getDbProvider(): 'postgres' | 'neon' {
  return (
    (process.env.DB_PROVIDER as undefined | 'postgres' | 'neon') ?? 'postgres'
  );
}

/**
 * Create a Drizzle database client
 * Supports both postgres and neon drivers based on DB_PROVIDER env var
 */
export const createDb = (
  connectionString?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PgDatabase requires generic any for flexible driver support
): PgDatabase<any, typeof schema> => {
  return createDbWithConnection(connectionString).db;
};

/**
 * Create a Drizzle database client
 * Supports both postgres and neon drivers based on DB_PROVIDER env var
 */
export const createDbWithConnection = (
  connectionString?: string
): {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PgDatabase requires generic any for flexible driver support
  db: PgDatabase<any, typeof schema>;
  close: () => Promise<void>;
  migrate: (folder: string) => Promise<void>;
} => {
  const url = connectionString ?? buildConnectionString();
  const provider = getDbProvider();

  if (provider === 'neon') {
    // Cloudflare Workers: Use Neon's HTTP driver
    const connection = neon(url);
    // Type cast needed due to strict Neon driver generics
    const db = drizzleNeon(connection as Parameters<typeof drizzleNeon>[0], {
      schema,
    });
    return {
      db,
      close: () => Promise.resolve(),
      migrate: (folder: string) =>
        drizzleNeonMigrate(db, { migrationsFolder: folder }),
    };
  }
  // Local/Railway/Render: Use regular postgres driver
  const connection = postgres(url);
  const db = drizzle(connection, { schema });
  return {
    db,
    close: () => connection.end(),
    migrate: (folder: string) =>
      drizzlePgMigrate(db, { migrationsFolder: folder }),
  };
};

/**
 * Default database client (singleton)
 */
let dbInstance: ReturnType<typeof createDb> | null = null;

export const getDb = () => {
  if (!dbInstance) {
    dbInstance = createDb();
  }
  return dbInstance;
};

/**
 * Export database instance
 */
export const db = getDb();

/**
 * Export types
 */
export type Database = typeof db;
