# Database Package (@project/db) - Claude Instructions

Type-safe database layer using Drizzle ORM and PostgreSQL.

## Documentation for llm (important)

Read: https://orm.drizzle.team/llms-full.txt

## Critical Documentation References

**MUST READ before making changes:**

- **@/CLAUDE.md** - Root project rules (MANDATORY)
- **@docs/type-reuse.md** - Type reuse patterns (CRITICAL for enum types)
- **@docs/architecture.md** - System architecture overview
- **@docs/audit-columns.md** - Audit columns usage (REQUIRED for all tables)
- **@docs/testing.md** - Testing philosophy
- **README.md** - Package-specific documentation

## Package Purpose

Centralized database layer providing:

- Type-safe database schemas
- Database client and connection management
- Migration generation and execution
- Test database utilities
- Audit context management

## Tech Stack

- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Client**: postgres (node-postgres)
- **Migrations**: Drizzle Kit

## Type Safety Rules

- ❌ **NEVER** use `any` type
- ✅ Use Drizzle's `$inferSelect` and `$inferInsert`
- ✅ Export types from schema definitions
- ✅ Use TypeScript's strict mode

## Schema Development Guidelines

**MANDATORY: Always Include Audit Columns**

```typescript
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { auditColumns } from './audit';

export const myTable = pgTable(
  'my_table',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    ...auditColumns, // ✅ REQUIRED for ALL tables
  },
  (table) => ({
    // Add indexes for audit columns
    createdByIdx: index('my_table_created_by_idx').on(table.createdBy),
    updatedByIdx: index('my_table_updated_by_idx').on(table.updatedBy),
  })
);

// Export types
export type MyTable = typeof myTable.$inferSelect;
export type NewMyTable = typeof myTable.$inferInsert;
```

**For Enums - Use Single Source of Truth (CRITICAL)**

**IMPORTANT**: Import VALUES from @project/shared, create enum, then INFER and EXPORT the type. DO NOT import the type from shared.

```typescript
import { pgEnum } from 'drizzle-orm/pg-core';
import { MY_STATUSES } from '@project/shared/types'; // ✅ Import VALUES only

// Create enum from shared values
export const myStatusEnum = pgEnum('my_status', MY_STATUSES);

// ✅ CORRECT: Infer and export the type from the enum
export type MyStatus = (typeof myStatusEnum.enumValues)[number];

// ❌ WRONG: Do NOT re-export type from shared
// export type { MyStatus } from '@project/shared/types';
```

**Why?** The database schema is the single source of truth for the TYPE, while @project/shared is the source of truth for VALUES. See **@docs/type-reuse.md** for details.

## Schema Checklist

When adding a new table:

1. ✅ Include audit columns (`...auditColumns`)
2. ✅ Add indexes for audit columns (createdBy, updatedBy)
3. ✅ Export types (`$inferSelect`, `$inferInsert`)
4. ✅ Export from `src/schema/index.ts`
5. ✅ Generate migration: `pnpm db:generate`
6. ✅ Review generated migration SQL
7. ✅ Apply migration: `pnpm db:migrate`
8. ✅ Update `clearTestDatabase()` in `test-utils.ts`
9. ✅ Run `pnpm check`

## Migration Workflow

```bash
# 1. Create/modify schema in src/schema/
# 2. Generate migration
pnpm db:generate

# 3. Review generated SQL in drizzle/ directory
# 4. Apply migration
pnpm db:migrate

# 5. Verify with Drizzle Studio
pnpm db:studio
```

## Test Database Utilities

**Per-Worker Database Isolation:**

- Each Vitest worker gets its own database
- Database created in global setup
- Tables cleared before each test
- Database dropped in global teardown

```typescript
import { createTestDb, clearTestDatabase } from '@project/db';

describe('Feature tests', () => {
  let db: Database;

  beforeAll(() => {
    db = createTestDb();
  });

  beforeEach(async () => {
    await clearTestDatabase(db);
  });
});
```

## Key Commands

```bash
pnpm build               # Build package
pnpm db:generate         # Generate migration from schema changes
pnpm db:migrate          # Apply migrations
pnpm db:push             # Push schema directly (dev only)
pnpm db:studio           # Open Drizzle Studio GUI
pnpm db:seed             # Seed database with sample data
pnpm test                # Run tests
pnpm check               # Typecheck + lint + format (MANDATORY)
```

## Critical Rules

- **ALWAYS** read root @/CLAUDE.md and @docs/audit-columns.md
- **ALWAYS** include audit columns in new tables
- **ALWAYS** add indexes for audit columns
- **ALWAYS** export types from schemas
- **ALWAYS** use single source of truth for enums (from @project/shared)
- **ALWAYS** review generated migration SQL
- **ALWAYS** update `clearTestDatabase()` for new tables
- **ALWAYS** run `pnpm check` before completing tasks
- ONLY modify what is explicitly requested
- Preserve existing schema patterns

## Environment Variables

```bash
# Database connection
DB_HOST=localhost
DB_PORT=43891
DB_USER=postgres
DB_PASSWORD=
DB_NAME=postgres

# For tests
VITEST_POOL_ID=1  # Automatically set by Vitest
```

## References

- **Audit Columns**: `src/schema/audit.ts`
- **Example Schema**: `src/schema/posts.ts` and `src/schema/users.ts`
- **Test Utilities**: `src/test-utils.ts`
- **Client**: `src/client.ts`
