# Audit Column System

Automated audit trail system for tracking data changes.

## Overview

All database tables **MUST** include audit columns that automatically track:

- **createdAt**: When record was created
- **updatedAt**: When record was last modified
- **createdBy**: User ID who created (nullable for system operations)
- **updatedBy**: User ID who last modified (nullable for system operations)

**These fields are automatically populated** - you never manually set them.

## Quick Start

### 1. Database Schema

```typescript
import { pgTable, uuid, text, index } from 'drizzle-orm/pg-core';
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

### 2. Repository

```typescript
import { BaseRepository } from '../../shared/base.repository';

export class MyRepository extends BaseRepository {
  async create(data: NewRecord) {
    return this.auditDb.insert(myTable).values(data).returning();
  }

  async update(id: string, data: Partial<Record>, tx?: DatabaseContext) {
    const db = this.getAuditableDb(tx);
    return db.update(myTable).set(data).where(eq(myTable.id, id)).returning();
  }
}
```

### 3. Service (DI Pattern)

```typescript
export class MyService {
  constructor(private createRepository: RepositoryFactory<MyRepository>) {}

  async create(input: CreateInput, db: DatabaseContext) {
    const repository = this.createRepository(db);
    return repository.create(input); // Audit fields auto-populated
  }
}
```

### 4. Router

```typescript
export const myRouter = t.router({
  create: protectedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      // Audit context handled automatically via AsyncLocalStorage
      return ctx.services.myFeature.create(input, ctx.db);
    }),
});
```

## How It Works

### Automatic Field Population

**On INSERT:**

```typescript
this.auditDb.insert(table).values({ name: 'John' });
// Becomes: { name: 'John', createdAt: now, updatedAt: now, createdBy: userId, updatedBy: userId }
```

**On UPDATE:**

```typescript
this.auditDb.update(table).set({ name: 'Jane' });
// Becomes: { name: 'Jane', updatedAt: now, updatedBy: userId }
```

**System Operations (no user):**

```typescript
// createdBy and updatedBy will be null
```

### User Context Flow

```
JWT Token → tRPC Middleware → AsyncLocalStorage → BaseRepository → Database
```

**Key Insight:** AuditContext stored in AsyncLocalStorage, available throughout async call chain without explicit parameter passing.

## Best Practices

**✅ DO:**

- Always use `auditColumns` in new tables
- Always extend `BaseRepository`
- Always add indexes for audit fields
- Test audit fields in integration tests

**❌ DON'T:**

- Never manually set audit fields
- Never use `this.db` for inserts/updates (use `this.auditDb`)
- Never skip `BaseRepository`
- Never pass `auditContext` as parameter (managed via AsyncLocalStorage)
