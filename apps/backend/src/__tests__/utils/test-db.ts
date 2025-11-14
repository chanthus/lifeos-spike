import { spawnSync } from 'node:child_process';
import postgres from 'postgres';
import { getDbCredentials, testDbPrefix } from '@project/db/client';

export interface DatabaseConfig {
  workerId: string;
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
}

export class TestDatabaseManager {
  private static instance: TestDatabaseManager;
  private testDb: DatabaseConfig | null = null;
  private static createdDatabases = new Map<string, DatabaseConfig>();

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- Singleton pattern requires private empty constructor
  private constructor() {}

  static getInstance(): TestDatabaseManager {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Singleton pattern requires instance check
    if (!TestDatabaseManager.instance) {
      TestDatabaseManager.instance = new TestDatabaseManager();
    }
    return TestDatabaseManager.instance;
  }

  static async cleanupAllDatabases(): Promise<void> {
    const { host, port, user, password } =
      TestDatabaseManager.getDatabaseConfig('');

    console.log('🧹 Cleaning up all test databases...');

    const existingTestDbs = this.findAllDatabaseConfigs(
      host,
      port,
      user,
      password
    );
    console.log(
      `Found ${existingTestDbs.length.toString()} test databases to cleanup`
    );

    for (const dbName of existingTestDbs) {
      await this.dropDatabase(dbName, host, port, user, password);
    }

    this.createdDatabases.clear();

    console.log('✅ All test databases cleaned up');
  }

  private static findAllDatabaseConfigs(
    host: string,
    port: number,
    user: string,
    password: string
  ): string[] {
    try {
      const result = spawnSync(
        'psql',
        ['-h', host, '-p', port.toString(), '-U', user, '-lqt'],
        {
          timeout: 5000,
          encoding: 'utf-8',
          env: {
            ...process.env,
            PGPASSWORD: password,
          },
        }
      );

      if (result.error) {
        return [];
      }

      const output = result.stdout;
      const databases = output
        .split('\n')
        .map((line) => {
          const trimmed = line.split('|')[0]?.trim();
          return trimmed ?? '';
        })
        .filter((dbName): dbName is string => {
          if (!dbName) return false;
          return dbName.startsWith(testDbPrefix);
        });

      return databases;
    } catch {
      return [];
    }
  }

  private static async dropDatabase(
    dbName: string,
    host: string,
    port: number,
    user: string,
    password: string
  ): Promise<void> {
    const baseUrl = `postgresql://${user}:${password}@${host}:${port.toString()}/postgres`;
    const connection = postgres(baseUrl, { max: 1 });

    try {
      await connection.unsafe(`DROP DATABASE IF EXISTS "${dbName}"`);
    } catch {
      // Ignore errors during cleanup
    } finally {
      await connection.end();
    }
  }

  async createWorkerDatabase(): Promise<DatabaseConfig> {
    const workerId = process.env.VITEST_POOL_ID ?? '1';
    const config = TestDatabaseManager.getDatabaseConfig(workerId);
    const cachedDb = this.getCachedDatabase(config.workerId);

    if (cachedDb) {
      return this.useExistingDatabase(cachedDb);
    }

    return this.createNewDatabase(config);
  }

  private static getDatabaseConfig(workerId: string): DatabaseConfig {
    const creds = getDbCredentials();
    const name = workerId ? `${testDbPrefix}${workerId}` : creds.database;

    return {
      workerId,
      host: creds.host,
      port: creds.port,
      user: creds.user,
      password: creds.password,
      name,
    };
  }

  private getCachedDatabase(workerId: string): DatabaseConfig | undefined {
    return TestDatabaseManager.createdDatabases.get(workerId);
  }

  private async useExistingDatabase(
    db: DatabaseConfig
  ): Promise<DatabaseConfig> {
    this.testDb = db;
    await this.resetWorkerDatabase();
    return this.testDb;
  }

  private async createNewDatabase(
    config: DatabaseConfig
  ): Promise<DatabaseConfig> {
    console.log(
      `🔧 Creating test database: ${config.name} (worker ${config.workerId})`
    );

    if (
      this.databaseExists(
        config.name,
        config.host,
        config.port,
        config.user,
        config.password
      )
    ) {
      return this.adoptExistingDatabase(config);
    }

    try {
      await this.executeCreateDatabase(config);
      await this.createSchema(config);

      return this.cacheAndReturnDatabase(config);
    } catch (error) {
      return this.handleDatabaseCreationError(error, config);
    }
  }

  private databaseExists(
    dbName: string,
    host: string,
    port: number,
    user: string,
    password: string
  ): boolean {
    try {
      const result = spawnSync(
        'psql',
        ['-h', host, '-p', port.toString(), '-U', user, '-lqt'],
        {
          timeout: 5000,
          encoding: 'utf-8',
          env: {
            ...process.env,
            PGPASSWORD: password,
          },
        }
      );

      if (result.error) {
        return false;
      }

      const output = result.stdout;
      const databases = output
        .split('\n')
        .map((line) => {
          const trimmed = line.split('|')[0]?.trim();
          return trimmed ?? '';
        })
        .filter(Boolean);

      return databases.includes(dbName);
    } catch {
      return false;
    }
  }

  private async executeCreateDatabase(config: DatabaseConfig): Promise<void> {
    const { host, port, user, password, name } = config;
    const baseUrl = `postgresql://${user}:${password}@${host}:${port.toString()}/postgres`;
    const connection = postgres(baseUrl, { max: 1 });

    try {
      await connection.unsafe(`CREATE DATABASE "${name}"`);
    } finally {
      await connection.end();
    }
  }

  private async createSchema(config: DatabaseConfig): Promise<void> {
    const { host, port, name, user, password } = config;
    const connectionString = `postgresql://${user}:${password}@${host}:${port.toString()}/${name}`;
    const connection = postgres(connectionString, { max: 1 });

    try {
      // Create enum type
      await connection`
        DO $$ BEGIN
          CREATE TYPE "post_status" AS ENUM('draft', 'published');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `;

      // Create posts table
      await connection`
        CREATE TABLE IF NOT EXISTS "posts" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "title" text NOT NULL,
          "content" text NOT NULL,
          "slug" text NOT NULL,
          "status" "post_status" DEFAULT 'draft' NOT NULL,
          "published_at" timestamp,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL,
          "created_by" uuid,
          "updated_by" uuid,
          CONSTRAINT "posts_slug_unique" UNIQUE("slug")
        );
      `;

      // Create indexes
      await connection`CREATE INDEX IF NOT EXISTS "posts_status_idx" ON "posts" ("status");`;
      await connection`CREATE INDEX IF NOT EXISTS "posts_created_by_idx" ON "posts" ("created_by");`;
      await connection`CREATE INDEX IF NOT EXISTS "posts_updated_by_idx" ON "posts" ("updated_by");`;
    } catch (error) {
      throw new Error(
        `Failed to create schema: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      await connection.end();
    }
  }

  private cacheAndReturnDatabase(config: DatabaseConfig): DatabaseConfig {
    TestDatabaseManager.createdDatabases.set(config.workerId, config);
    console.log(`✅ Test database created: ${config.name}`);
    this.testDb = config;
    return this.testDb;
  }

  private async handleDatabaseCreationError(
    error: unknown,
    config: DatabaseConfig
  ): Promise<DatabaseConfig> {
    if (error instanceof Error && error.message.includes('already exists')) {
      return this.adoptExistingDatabase(config);
    }

    console.error(`Failed to create test database ${config.name}:`, error);
    throw new Error(
      `Failed to create test database ${config.name}. Ensure PostgreSQL is running on port ${config.port.toString()}. Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  private async adoptExistingDatabase(
    config: DatabaseConfig
  ): Promise<DatabaseConfig> {
    TestDatabaseManager.createdDatabases.set(config.workerId, config);
    this.testDb = config;

    // Create schema (CREATE IF NOT EXISTS will handle if it already exists)
    await this.createSchema(config);

    // Reset data
    await this.resetWorkerDatabase();
    return this.testDb;
  }

  private async resetWorkerDatabase(): Promise<void> {
    if (!this.testDb) {
      throw new Error('No test database to reset');
    }

    try {
      await this.truncateAllTables(this.testDb);
    } catch {
      // Ignore truncate errors on first run
    }
  }

  private async truncateAllTables(config: DatabaseConfig): Promise<void> {
    const { host, port, name, user, password } = config;
    const connectionString = `postgresql://${user}:${password}@${host}:${port.toString()}/${name}`;
    const connection = postgres(connectionString, { max: 1 });

    try {
      await connection.unsafe(`
        DO $$
        DECLARE
          table_name TEXT;
        BEGIN
          FOR table_name IN
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
          LOOP
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(table_name) || ' RESTART IDENTITY CASCADE;';
          END LOOP;
        END $$;
      `);
    } finally {
      await connection.end();
    }
  }
}

export const testDbManager = TestDatabaseManager.getInstance();
