import type { Config } from 'drizzle-kit';

// Build connection string from environment variables
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '43891';
const database = process.env.DB_NAME || 'postgres';
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || 'postgres';

const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;

export default {
  schema: './src/schema/*.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString,
  },
  verbose: true,
  strict: true,
} satisfies Config;
