import { sql } from 'drizzle-orm';
import { createDb } from '@project/db';

export async function resetDatabase(): Promise<void> {
  console.log('🔄 Resetting test database');

  // Create a new db connection - automatically uses test database in test environment
  const db = createDb();

  try {
    await db.execute(
      sql.raw(`
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
    `)
    );

    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    throw new Error(
      `Failed to reset database: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
