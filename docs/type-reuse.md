# Type Reuse Patterns

Guidelines for avoiding type duplication and maintaining single sources of truth across the monorepo.

## Core Principle: Single Source of Truth

**CRITICAL**: Each type should have exactly ONE authoritative definition. All other usages should reference or infer from that definition.

## Pattern 1: Enum Types (Database-backed)

For enum types that map to database columns (e.g., post status, user role):

### Step 1: Define Values in @project/shared

```typescript
// packages/shared/src/types/post.ts

/**
 * Post status values
 * Single source of truth for the VALUES array
 * The TYPE is defined in @project/db schema
 */
export const POST_STATUSES = ['draft', 'published'] as const;
```

**Key Points:**

- ✅ Export the const array with `as const`
- ✅ Document that this is the single source of truth for VALUES
- ❌ DO NOT export a type here (it's defined in the db schema)

### Step 2: Create Enum and Export Type in @project/db

```typescript
// packages/db/src/schema/posts.ts
import { pgEnum } from 'drizzle-orm/pg-core';
import { POST_STATUSES } from '@project/shared/types';

// Create enum using values from shared
export const postStatusEnum = pgEnum('post_status', POST_STATUSES);

// Infer and export the type from the enum
export type PostStatus = (typeof postStatusEnum.enumValues)[number];
```

**Key Points:**

- ✅ Import VALUES from @project/shared
- ✅ Create pgEnum with those values
- ✅ Infer type from enum and export it
- ❌ DO NOT duplicate the type definition

### Step 3: Backend Uses Type from @project/db

```typescript
// apps/backend/src/features/posts/posts.service.ts
import type { Database, PostStatus } from '@project/db';

async createPost(
  data: {
    title: string;
    status?: PostStatus;  // ✅ Type from @project/db
  },
  db: Database
): Promise<Post> {
  // Implementation
}
```

**Key Points:**

- ✅ Import PostStatus from @project/db
- ❌ DO NOT import from @project/shared

### Step 4: Frontend Infers Types from tRPC

```typescript
// apps/admin/app/posts/page.tsx
import type { RouterOutput } from '@project/backend/client';

// Infer types from tRPC router output
type Post = RouterOutput['posts']['list']['items'][number];
type PostStatus = Post['status']; // ✅ Inferred from tRPC

interface PostFormData {
  status: PostStatus; // ✅ Uses inferred type
}
```

**Key Points:**

- ✅ Import from `@project/backend/client` (frontend-safe exports)
- ✅ Infer all types from tRPC RouterOutput
- ❌ NEVER import from `@project/backend` (main export - server-only)
- ❌ NEVER import types from @project/shared in frontend
- ❌ NEVER import types from @project/db in frontend

## Pattern 2: Regular Types (Non-Enum)

For types that don't map to database enums:

### Shared Types (@project/shared)

```typescript
// packages/shared/src/types/common.ts

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}
```

### Backend Uses Shared Types

```typescript
// apps/backend/src/shared/pagination.types.ts
import type { PaginationMeta } from '@project/shared/types';

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta; // ✅ Reuses shared type
}
```

### Frontend Infers from tRPC

```typescript
// apps/web/app/posts/page.tsx
import type { RouterOutput } from '@project/backend/client';

// ✅ Infer pagination types from tRPC
type PostsResponse = RouterOutput['posts']['list'];
type Post = PostsResponse['items'][number];
```

## Frontend/Backend Boundary Pattern

**CRITICAL**: Frontend apps must NEVER import from the main `@project/backend` export, as it contains server-only code (database connections, Node.js modules) that will break browser/mobile builds.

### The Problem

```typescript
// ❌ WRONG - This breaks in browsers!
import type { RouterOutput } from '@project/backend';
// This imports the main index.ts which includes:
// - Database connections (postgres/pg)
// - Node.js server code (cors, http server)
// - Server-only validation schemas (Zod)
```

### The Solution: /client Export

The backend package provides a special `/client` export that contains ONLY frontend-safe exports:

```typescript
// ✅ CORRECT - Frontend-safe imports
import type {
  AppRouter,
  RouterInput,
  RouterOutput,
} from '@project/backend/client';
import { POST_STATUSES } from '@project/backend/client';

// The /client export contains ONLY:
// - Type-only exports (no runtime code)
// - Constant arrays (browser-safe)
// - tRPC router types
```

### What's in /client

**✅ Allowed:**

- `export type { AppRouter, RouterInput, RouterOutput }`
- `export type { PageInfo, PaginatedResponse }`
- `export { POST_STATUSES }` (const arrays)
- Type re-exports from `@project/shared`

**❌ Forbidden:**

- Zod schema objects (validation logic)
- Database table definitions
- Server context or middleware
- Anything importing Node.js modules

### ESLint Enforcement

The monorepo enforces this boundary with ESLint rules:

```javascript
// ❌ ESLint will error on these imports in frontend apps:
import type { AppRouter } from '@project/backend';
import type { AppRouter } from '@project/backend/router';

// ✅ Only this is allowed:
import type { AppRouter } from '@project/backend/client';
```

**Error Message:**

```
Frontend apps must import from "@project/backend/client" for browser-safe exports.
The main backend export contains server-only code (database, Node.js modules)
that will break browser builds.
```

### Usage in Frontend Apps

```typescript
// apps/web/lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@project/backend/client';

export const trpc = createTRPCReact<AppRouter>();
```

```typescript
// apps/admin/app/posts/page.tsx
import type { RouterOutput } from '@project/backend/client';

type Post = RouterOutput['posts']['list']['items'][number];
```

### Adding to /client

When adding new types to export from backend:

1. ✅ Only add type-only exports or const arrays
2. ✅ Verify no server-only imports
3. ✅ Test that frontend apps can import
4. ✅ Document in /client comments

## Anti-Patterns to Avoid

### ❌ Duplicating Enum Types

```typescript
// packages/shared/src/types/post.ts
export const POST_STATUSES = ['draft', 'published'] as const;
export type PostStatus = (typeof POST_STATUSES)[number]; // ❌ WRONG - duplicates db type
```

### ❌ Frontend Importing from Shared/DB/Backend

```typescript
// apps/admin/app/posts/page.tsx
import type { PostStatus } from '@project/shared/types'; // ❌ WRONG
import type { PostStatus } from '@project/db'; // ❌ WRONG
import type { RouterOutput } from '@project/backend'; // ❌ WRONG - server-only

// ✅ CORRECT - infer from tRPC using /client
import type { RouterOutput } from '@project/backend/client';
type Post = RouterOutput['posts']['get'];
type PostStatus = Post['status'];
```

### ❌ Hardcoding Union Types

```typescript
// ❌ WRONG - duplicates the values
function updateStatus(status: 'draft' | 'published') {}

// ✅ CORRECT - uses the type
import type { PostStatus } from '@project/db';
function updateStatus(status: PostStatus) {}
```

## Type Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Type Flow for Enums                      │
└─────────────────────────────────────────────────────────────┘

@project/shared/types
  ↓ (VALUES only)
  export const POST_STATUSES = ['draft', 'published'] as const;

  ↓ Import

@project/db/schema
  ↓ (Creates enum + exports TYPE)
  export const postStatusEnum = pgEnum('post_status', POST_STATUSES);
  export type PostStatus = (typeof postStatusEnum.enumValues)[number];

  ↓ Import

@project/backend
  ↓ (Uses type)
  import type { PostStatus } from '@project/db';

  ↓ tRPC exposes

Frontend Apps (@project/admin, @project/web, @project/mobile)
  ↓ (Infers type from /client)
  import type { RouterOutput } from '@project/backend/client';
  type PostStatus = RouterOutput['posts']['get']['status'];
```

## Checklist for Adding New Enum Types

When adding a new enum type (e.g., `ORDER_STATUS`):

1. ✅ Define VALUES array in `@project/shared/src/types/[domain].ts`
2. ✅ Create pgEnum in `@project/db/src/schema/[table].ts` using VALUES
3. ✅ Infer and export TYPE from enum in db schema
4. ✅ Backend imports TYPE from `@project/db`
5. ✅ Frontend infers TYPE from tRPC `RouterOutput`
6. ✅ Update this documentation if pattern differs
7. ✅ Run `pnpm check` to verify

## Benefits

- ✅ Single source of truth for values
- ✅ Type safety across entire stack
- ✅ No duplicate type definitions
- ✅ Automatic type inference in frontend
- ✅ Changes propagate automatically via types

## References

- **Example**: `packages/shared/src/types/post.ts` - POST_STATUSES values
- **Example**: `packages/db/src/schema/posts.ts` - PostStatus type
- **Example**: `apps/admin/app/posts/page.tsx` - tRPC type inference
- **Frontend Guidelines**: See @docs/frontend.md for tRPC type inference patterns
