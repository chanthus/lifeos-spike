# Architecture & Design Guidelines

Architectural principles, design patterns, and planning processes for the monorepo.

## Architectural Philosophy

**Feature-based architecture** with strong type safety, clear separation of concerns, and end-to-end type safety through tRPC.

## Technology Stack

**Backend:** Node.js + Vite + tRPC + Drizzle ORM + PostgreSQL
**Frontend:** React + Next.js (App Router) + TanStack Query + NativeWind v4 + React Native Reusables + React Native (mobile)
**Monorepo:** pnpm + Turborepo + TypeScript

## Core Architectural Principles

### 1. Type Safety First

- **Database → API**: Drizzle inferred types (`typeof schema.$inferSelect`)
- **API → Frontend**: tRPC automatic type inference
- **No manual type duplication**: Single source of truth
- **Compile-time safety**: Catch errors before runtime

### 2. Feature-Based Organization

```
apps/backend/src/features/users/
  users.schema.ts       ← Zod validation
  users.repository.ts   ← Data access (extends BaseRepository)
  users.service.ts      ← Business logic (DI pattern)
  users.router.ts       ← tRPC endpoints
  users.router.test.ts  ← Integration tests
```

### 3. Separation of Concerns

Five distinct layers within each feature:

1. **Schema** - Zod validation schemas
2. **Repository** - Data access (extends BaseRepository)
3. **Service** - Business logic (DI pattern)
4. **Router** - tRPC endpoints
5. **Tests** - Co-located integration tests

### 4. Database Design Excellence

- **UUIDs for primary keys** - Never auto-increment
- **Audit columns on all tables** - Automatic tracking (see @docs/audit-columns.md)
- **Proper indexes** - Performance from the start
- **Referential integrity** - Foreign keys and constraints
- **Normalized schemas** - Reduce duplication

### 5. Dependency Injection (DI)

DI pattern combining best practices for performance and maintainability:

- **Singleton Container**: Created once and reused across requests
- **Service Singletons**: Stateless services accessed via `ctx.services.*`
- **Repository Factories**: Services receive factory functions in constructor
- **Request Scoping**: Services instantiate repositories on-demand
- **Transaction Support**: Services accept optional `tx?: Database` parameter

**Pattern:**

```typescript
// Service receives factory in constructor
class PostService {
  constructor(private createRepo: RepositoryFactory<PostRepository>) {}

  async create(data: CreatePostInput, db: Database) {
    const repo = this.createRepo(db); // Instantiate on-demand
    return repo.create(data);
  }
}

// Container wires dependencies
const postService = new PostService(repositories.posts);

// Router passes db to service
ctx.services.posts.create(input, ctx.db);
```

### 6. API Design Consistency

**Standard CRUD pattern for all routers:**

- `list` - Paginated list with filters/sorting
- `get` - Fetch by ID
- `create` - Create new record
- `update` - Update existing record
- `delete` - Delete record

## Planning Process for New Features

### 1. Business Analysis

- **Purpose** - What problem does this solve?
- **User Stories** - Who needs this and why?
- **Success Criteria** - How do we measure success?

### 2. Technical Design

- **Database Schema** - Tables, columns, types, constraints, indexes, audit columns
- **API Endpoints** - tRPC procedures (list, get, create, update, delete)
- **Component Architecture** - Pages, UI components, state management
- **Validation** - Zod schemas for inputs

### 3. Implementation Plan

- Database schema and migrations
- Repository (extends BaseRepository)
- Service layer (DI pattern)
- tRPC router
- Frontend components
- Integration tests (MANDATORY)

### 4. Quality Assurance

- Integration tests required
- Performance considerations
- Security review
- Code review checklist

## Decision-Making Framework

Evaluate every architectural decision against:

- **✅ Consistency** - Follows existing patterns?
- **✅ Scalability** - Will it scale?
- **✅ Maintainability** - Easy to understand and modify?
- **✅ Performance** - Performance implications?
- **✅ Type Safety** - Maintains end-to-end type safety?
- **✅ Security** - Security considerations?

## Performance Considerations

**Database:**

- Index frequently queried columns
- Use joins (prevent N+1)
- Implement pagination for large datasets
- Use transactions for consistency

**API:**

- Implement caching strategies
- Batch related queries
- Optimize payload sizes

**Frontend:**

- Code splitting by route
- Lazy load heavy components
- Virtual scrolling for long lists
- Leverage React Query caching

## Security Considerations

**Authentication & Authorization:**

- JWT-based authentication
- Role-based access control
- Protected procedures in tRPC

**Input Validation:**

- Validate all inputs with Zod
- Sanitize user input
- Use parameterized queries (Drizzle)
- Rate limiting on sensitive endpoints

**Data Protection:**

- Never expose sensitive data
- Encrypt data at rest
- Environment variables for secrets
- Audit logging (automatic via audit columns)

## Reference Documentation

- **Backend patterns**: @docs/backend.md
- **Frontend patterns**: @docs/frontend.md
- **Testing strategy**: @docs/testing.md
- **Code review**: @docs/code-review.md
