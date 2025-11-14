import { buildConnectionString, createDbWithConnection } from './client';

/**
 * Run database migrations
 */
async function runMigrations() {
  const connectionString = buildConnectionString();

  console.log('🔄 Running migrations...');
  console.log(`📦 Database: ${connectionString.replace(/:[^:]*@/, ':****@')}`);

  const { close, migrate } = createDbWithConnection(buildConnectionString());

  try {
    await migrate('./drizzle');
    console.log('✅ Migrations completed successfully!');
  } catch (error: unknown) {
    console.error('❌ Migration failed:', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === '3D000'
    ) {
      console.log('\n💡 The database does not exist. Please run:');
      console.log('   pnpm infra        - Start PostgreSQL');
      console.log('\nOr create the database manually:');
      console.log('   createdb -U postgres postgres');
    } else if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ECONNREFUSED'
    ) {
      console.log('\n💡 Could not connect to PostgreSQL. Please run:');
      console.log('   pnpm infra        - Start PostgreSQL');
      console.log('   pnpm infra:status - Check PostgreSQL status');
    }

    process.exit(1);
  } finally {
    await close();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  void runMigrations();
}

export { runMigrations };
