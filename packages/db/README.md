# @project/db

Database package using Drizzle ORM and PostgreSQL.

## Features

- 🗄️ Type-safe database queries with Drizzle ORM
- 🔄 Database migrations
- 🌱 Seed data scripts
- 🧪 Test utilities with isolated test databases per worker
- 📊 Drizzle Studio for database visualization

## Structure

```
src/
├── schema/           # Drizzle schemas
│   ├── users.ts
│   └── posts.ts
├── client.ts         # Database client
├── migrate.ts        # Migration runner
├── seed.ts           # Seed data
├── test-utils.ts     # Test database utilities
└── index.ts          # Barrel exports
```

## Usage

### Database Client

```typescript
import { db } from '@project/db';
import { users } from '@project/db/schema';

// Query users
const allUsers = await db.select().from(users);

// Insert user
const [newUser] = await db
  .insert(users)
  .values({
    email: 'user@example.com',
    name: 'John Doe',
    passwordHash: 'hashed_password',
  })
  .returning();
```

### Schemas

```typescript
import { users, posts, type User, type NewUser } from '@project/db/schema';

// User type is inferred from schema
const user: User = {
  id: '123',
  email: 'user@example.com',
  name: 'John Doe',
  // ...
};
```

## Development

```bash
# Generate migrations from schema changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio

# Seed database
pnpm db:seed

# Build package
pnpm build

# Run tests
pnpm test
```

## Environment Variables

```bash
# Database connection details
DB_HOST=localhost
DB_PORT=43891
DB_USER=postgres
DB_PASSWORD=
DB_NAME=postgres
```

## Testing

This package includes utilities for test database isolation:

```typescript
import {
  setupTestDatabase,
  createTestDb,
  clearTestDatabase,
  dropTestDatabase,
} from '@project/db';
import { beforeAll, afterAll, beforeEach, describe, it } from 'vitest';

describe('User tests', () => {
  let db: ReturnType<typeof createTestDb>;

  beforeAll(async () => {
    // Database is created and migrated by global setup
    db = createTestDb();
  });

  beforeEach(async () => {
    // Clear data before each test
    await clearTestDatabase(db);
  });

  afterAll(async () => {
    // Database is dropped by global teardown
  });

  it('should create a user', async () => {
    // Test code here
  });
});
```

### How Test Database Isolation Works

1. **Per Worker**: Each Vitest worker gets its own database (e.g., `test_worker_1`)
2. **Global Setup**: Database is created and migrated once per worker before all tests
3. **Per Test**: Tables are cleared (truncated) before each test
4. **Global Teardown**: Database is dropped after all tests in the worker complete

This approach:

- ✅ Runs test files in parallel (different workers, different databases)
- ✅ Runs tests within a file sequentially (same database, cleared between tests)
- ✅ Uses real Postgres (catches DB-specific issues)
- ✅ Fast (minimal database creation/destruction)

## Adding New Tables

1. Create schema file in `src/schema/`
2. Export from `src/schema/index.ts`
3. Generate migration: `pnpm db:generate`
4. Run migration: `pnpm db:migrate`
5. Update `clearTestDatabase()` in `test-utils.ts` if needed

## Dependencies

- `drizzle-orm` - TypeScript ORM
- `postgres` - PostgreSQL client
- `@project/shared` - Shared types and utilities
