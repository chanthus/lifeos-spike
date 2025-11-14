# Backend App - Claude Instructions

Backend API service using tRPC, Drizzle ORM, and PostgreSQL.

## Critical Documentation References

**MUST READ before making changes:**

- **@/CLAUDE.md** - Root project rules (MANDATORY)
- **@docs/backend.md** - Backend development patterns and rules
- **@docs/type-reuse.md** - Type reuse patterns (CRITICAL - import types from @project/db, NOT @project/shared)
- **@docs/architecture.md** - System architecture overview
- **@docs/testing.md** - Testing philosophy and requirements
- **@docs/pagination.md** - Pagination implementation patterns
- **@docs/audit-columns.md** - Audit columns usage (REQUIRED for all tables)

## Quick Reference

### Feature Implementation Checklist

When adding a new feature:

1. ✅ Create database schema in `@packages/db/src/schema/[entity].ts`
2. ✅ Include audit columns (`...auditColumns`)
3. ✅ Generate and run migration: `pnpm db:generate && pnpm db:migrate`
4. ✅ Create feature files:
   - `[entity].schema.ts` - Zod validation
   - `[entity].repository.ts` - Extends BaseRepository
   - `[entity].service.ts` - Business logic
   - `[entity].router.ts` - tRPC endpoints
   - `[entity].router.test.ts` - Integration tests (MANDATORY)
5. ✅ Register in DI container (`src/di/container.impl.ts`)
6. ✅ Add to main router (`src/router.ts`)
7. ✅ Run `pnpm check` - MUST pass

### Type Safety Rules

- ❌ **NEVER** use `any` type
- ✅ Use `unknown` for unknown types + type guards
- ✅ Use Drizzle's `$inferSelect` and `$inferInsert`
- ✅ Use Zod schemas with type inference
- ✅ Leverage tRPC's automatic type inference

### Frontend/Backend Boundary (CRITICAL)

**Frontend apps MUST import from `@project/backend/client`, NOT the main export!**

The backend package has two entry points:

1. **Main export (`@project/backend`)**: Server-only code (database, Node.js modules)
   - Used ONLY by the backend server itself
   - Contains database connections, validation schemas, server middleware
   - ❌ Frontend apps MUST NOT import from this

2. **Client export (`@project/backend/client`)**: Frontend-safe exports
   - Used by ALL frontend apps (web, admin, mobile, marketing)
   - Contains ONLY types and constants (no runtime server code)
   - ✅ Frontend apps MUST import from this

**Adding exports to /client:**

When adding new types that frontend needs:

1. ✅ Add to `src/client.ts` with type-only exports
2. ✅ Never export Zod schemas or database code
3. ✅ Only export: `AppRouter`, `RouterInput`, `RouterOutput`, const arrays

See **@docs/type-reuse.md** for complete pattern.

### Mandatory Patterns

**Audit Columns (REQUIRED):**

```typescript
import { auditColumns } from './audit';

export const myTable = pgTable('my_table', {
  id: uuid('id').defaultRandom().primaryKey(),
  ...auditColumns, // ✅ ALWAYS include
});
```

**BaseRepository (REQUIRED):**

```typescript
export class MyRepository extends BaseRepository {
  async create(data: NewRecord) {
    return this.auditDb.insert(myTable).values(data).returning();
  }
}
```

**Dependency Injection:**

The monorepo uses a DI pattern combining:

- **Singleton Container** - Created once and reused
- **Service Singletons** - Stateless services accessed via `ctx.services.*`
- **Repository Factories** - Services receive factory functions in constructor
- **Request Scoping** - Services instantiate repositories on-demand

**Pattern:**

```typescript
// Service receives factory in constructor
class PostService {
  constructor(private createRepo: RepositoryFactory<PostRepository>) {}
  async create(data, db: Database) {
    const repo = this.createRepo(db);
    return repo.create(data);
  }
}

// Router passes db to service
ctx.services.posts.create(input, ctx.db);
```

### Integration Tests (MANDATORY)

**Required for ALL new endpoints:**

```typescript
import {
  createTestCaller,
  createTestAuditContext,
} from '../../__tests__/utils/test-caller';
import { runWithAuditContext } from '../../shared/audit-context-storage';

describe('MyRouter', () => {
  // Note: Database cleanup is handled by global setup.ts resetDatabase()

  it('should create entity', async () => {
    const caller = createTestCaller();
    const result = await caller.myRouter.create({
      /* data */
    });
    expect(result).toMatchObject({
      /* expected */
    });
  });

  it('should populate audit columns', async () => {
    const caller = createTestCaller();
    const auditContext = createTestAuditContext('user-id-123');
    const result = await runWithAuditContext(auditContext, () =>
      caller.myRouter.create({
        /* data */
      })
    );
    expect(result.createdBy).toBe('user-id-123');
    expect(result.updatedBy).toBe('user-id-123');
  });
});
```

### Error Handling

Use TRPCError with proper codes:

- `INTERNAL_SERVER_ERROR` - Unexpected errors
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid input
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Not authorized

## Key Commands

```bash
pnpm dev                 # Start dev server (port 43895)
pnpm build               # Build for production
pnpm test                # Run integration tests
pnpm db:generate         # Generate migration
pnpm db:migrate          # Apply migrations
pnpm db:studio           # Database GUI
pnpm check               # Typecheck + lint + format (MANDATORY)
```

## Critical Rules

- **ALWAYS** read root @/CLAUDE.md and @docs/backend.md
- **ALWAYS** include audit columns in new tables
- **ALWAYS** extend BaseRepository for data access
- **ALWAYS** write integration tests for new endpoints
- **ALWAYS** run `pnpm check` before completing tasks
- ONLY modify what is explicitly requested
- Preserve existing code style and patterns
- Use feature-based architecture strictly

## Environment Variables

```bash
# Database (required)
DB_HOST=localhost
DB_PORT=43891
DB_USER=postgres
DB_PASSWORD=
DB_NAME=postgres

# Server (optional)
PORT=43893
NODE_ENV=development
```

## References

See existing features for implementation patterns:

- `src/features/posts/` - Full CRUD example with pagination
