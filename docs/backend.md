# Backend Development Guidelines

Backend development patterns for the monorepo. Supplements root @CLAUDE.md with backend-specific rules.

## TypeScript Best Practices (MANDATORY)

**Type Safety Rules:**

- ❌ **NEVER** use `any` type
- ✅ Use `unknown` for truly unknown types, then narrow with type guards
- ✅ Use Drizzle's inferred types (`typeof schema.$inferSelect`, `typeof schema.$inferInsert`)
- ✅ Use Zod schemas with automatic type inference
- ✅ Leverage tRPC's automatic type inference

## Mandatory Patterns

### 1. Audit Columns (MANDATORY for ALL Tables)

**ALWAYS include audit columns in new tables** - provides automatic tracking of createdAt, updatedAt, createdBy, updatedBy.

```typescript
import { auditColumns } from './audit';

export const myTable = pgTable(
  'my_table',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    ...auditColumns, // ✅ REQUIRED
  },
  (table) => ({
    createdByIdx: index('my_table_created_by_idx').on(table.createdBy),
    updatedByIdx: index('my_table_updated_by_idx').on(table.updatedBy),
  })
);
```

**Reference:** See @docs/audit-columns.md for complete guide

### 2. BaseRepository Pattern (MANDATORY)

**ALWAYS extend BaseRepository** - provides automatic audit tracking.

```typescript
export class MyRepository extends BaseRepository {
  async create(data: NewRecord) {
    return this.auditDb.insert(myTable).values(data).returning();
  }
}
```

### 3. Dependency Injection (MANDATORY)

The monorepo uses a hybrid DI pattern for optimal performance and maintainability.

**Quick Reference:**

```typescript
// Service receives repository factory in constructor
export class PostService {
  constructor(private createRepository: RepositoryFactory<PostRepository>) {}

  async createPost(data: CreatePostInput, db: Database): Promise<Post> {
    const repo = this.createRepository(db); // Instantiate on-demand
    return repo.create(data);
  }
}

// Container wires dependencies
const postService = new PostService(repositories.posts);

// Router passes db to service
ctx.services.posts.createPost(input, ctx.db);
```

**Key Principles:**

- **Services are SINGLETONS** - Created once, accessed via `ctx.services.*`
- **Repositories are REQUEST-SCOPED** - Created per-request via factory functions
- **Services receive factories** - Repository factories injected in constructor
- **Services accept `db`** - Pass `Database` to methods, not full Context
- **Transaction support** - Services can accept optional `tx?: Database`

### 4. Audit Context via AsyncLocalStorage (MANDATORY)

**AuditContext is automatically managed** - no need to pass as parameter.

- tRPC middleware sets context using `runWithAuditContext()`
- `BaseRepository` retrieves via `getAuditContext()`
- Audit fields populated automatically

## Required Files Per Feature

1. **`[entity].schema.ts`** - Zod validation schemas
2. **`[entity].repository.ts`** - Data access (extends BaseRepository)
3. **`[entity].service.ts`** - Business logic + side effects
4. **`[entity].router.ts`** - tRPC endpoints
5. **`[entity].router.test.ts`** - Integration tests

## Feature Implementation Workflow

### For New Database Entity

1. Create schema in `packages/db/src/schema/[entity].ts`
2. Export from `packages/db/src/schema/index.ts`
3. Generate migration: `pnpm db:generate && pnpm db:migrate`
4. Create feature directory in `apps/backend/src/features/[entity]/`
5. Implement: schema, repository, service, router, tests
6. Register in DI container
7. Add router to main app router
8. Export types from API package index

## Error Handling

Use TRPCError with appropriate codes:

- `INTERNAL_SERVER_ERROR` - Unexpected errors
- `NOT_FOUND` - Resource doesn't exist
- `BAD_REQUEST` - Invalid input
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Not authorized

```typescript
import { TRPCError } from '@trpc/server';

if (!entity) {
  throw new TRPCError({ code: 'NOT_FOUND', message: 'Entity not found' });
}
```

## Performance & Security

### Query Optimization

- Use proper joins and indexes
- Prevent N+1 problems
- Use transactions for multi-table operations
- Implement pagination for list endpoints (see @docs/pagination.md)

### Input Validation

- Validate all inputs with Zod schemas
- Sanitize user input
- Use parameterized queries (Drizzle handles this)

### Security

- Never expose sensitive data in responses
- Use environment variables for secrets
- Validate JWT tokens properly
- Implement proper authorization checks

## Key Commands

```bash
pnpm db:generate    # Generate migrations
pnpm db:migrate     # Apply migrations
pnpm db:studio      # Database inspection
pnpm check          # MUST pass before completing tasks
```

## Critical Rules

- **ALWAYS** read root @CLAUDE.md for global rules
- ONLY modify what is explicitly requested
- Preserve existing code style and patterns
- ALWAYS run `pnpm check` after changes
- Follow feature-based architecture strictly
- Use existing patterns (see reference implementations)
