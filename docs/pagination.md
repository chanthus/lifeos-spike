# Pagination Implementation Guide

Cursor-based pagination implementation for the monorepo.

## Overview

The monorepo uses **cursor-based pagination** via `CursorPagination` class:

- Efficient navigation through large datasets (no offset/limit performance issues)
- Bidirectional navigation (forward/backward)
- Stable ordering even when data changes
- Type-safe integration via tRPC
- Filtering and sorting support

**Architecture:**

```
Frontend → tRPC → Router → Service → Repository → CursorPagination → Database
```

## Backend Implementation

### 1. Schema Definition

```typescript
import { z } from 'zod';
import {
  basePaginationInputSchema,
  createPaginationSortSchema,
} from '../../shared/pagination.schema';

const userSortColumns = ['createdAt', 'email', 'name', 'status'] as const;

export const listUsersSchema = z
  .object({
    ...basePaginationInputSchema.shape, // cursor, pageSize, direction
    sort: createPaginationSortSchema(userSortColumns),
    status: z.enum(['active', 'suspended']).optional(),
    search: z.string().optional(),
  })
  .optional();
```

### 2. Repository Implementation

```typescript
import { BaseRepository } from '../../shared/base.repository';
import { CursorCodec, CursorPagination } from '../../shared/pagination/cursor';

export class UserRepository extends BaseRepository {
  private readonly sortableColumns = {
    createdAt: users.createdAt,
    email: users.email,
    name: users.name,
  } as const;

  private readonly pagination: CursorPagination<typeof users, User>;

  constructor(db: DatabaseContext) {
    super(db);
    const codec = new CursorCodec(users);
    this.pagination = new CursorPagination(users, codec);
  }

  async findUsers(
    input?: PaginationInput<UserSortColumn> & { status?: string }
  ) {
    const filters = [];
    if (input?.status) filters.push(eq(users.status, input.status));

    const baseCondition = filters.length > 1 ? and(...filters) : filters[0];
    const baseQuery = this.db.select().from(users).$dynamic();

    return this.pagination.paginate(
      baseQuery,
      input,
      this.sortableColumns,
      baseCondition
    );
  }
}
```

### 3. Service Layer

```typescript
export class UserService {
  async listUsers(input, db) {
    const repo = this.createRepository(db);
    return repo.findUsers(input);
  }
}
```

### 4. Router

```typescript
export const userRouter = router({
  list: protectedProcedure
    .input(listUsersSchema)
    .query(async ({ input, ctx }) => {
      return ctx.services.user.listUsers(input, ctx.db);
    }),
});
```

### 5. Request/Response Structure

**Request:**

```typescript
{
  cursor?: string,
  pageSize?: number,           // 1-100, default: 10
  direction?: 'forward' | 'backward',
  sort?: {
    column: 'createdAt' | 'email',
    direction: 'asc' | 'desc'
  },
  // Custom filters
  status?: 'active' | 'suspended'
}
```

**Response:**

```typescript
{
  items: User[],
  pageInfo: {
    hasNextPage: boolean,
    hasPreviousPage: boolean,
    startCursor: string | null,
    endCursor: string | null
  }
}
```

## Frontend Implementation

### 1. Pagination Hook

```typescript
import { useCursorPagination } from '@/lib/hooks/useCursorPagination';

const pagination = useCursorPagination({ initialPageSize: 10 });

// Available methods:
// - pagination.goNext(endCursor)
// - pagination.goPrevious()
// - pagination.reset()
// - pagination.cursor
// - pagination.canGoPrevious
```

### 2. Pagination Controls

```typescript
import { PaginationControls } from '@project/ui';

<PaginationControls
  onNext={() => pagination.goNext(data?.pageInfo.endCursor ?? null)}
  onPrevious={() => pagination.goPrevious()}
  hasNextPage={data?.pageInfo.hasNextPage ?? false}
  hasPreviousPage={pagination.canGoPrevious}
  isLoading={isLoading}
/>
```

### 3. Page Component

```typescript
export function Users() {
  const [filters, setFilters] = useState({});
  const pagination = useCursorPagination({ initialPageSize: 10 });

  const { data, isLoading } = trpc.admin.listUsers.useQuery({
    cursor: pagination.cursor,
    pageSize: pagination.pageSize,
    direction: pagination.direction,
    ...filters,
  });

  // Reset pagination when filters change
  useEffect(() => {
    pagination.reset();
  }, [filters]);

  return (
    <div>
      <UserTable users={data?.items || []} />
      <PaginationControls {...} />
    </div>
  );
}
```

## Common Patterns

### 1. Define Sortable Columns

```typescript
private readonly sortableColumns = {
  createdAt: users.createdAt,
  email: users.email,
} as const;
```

### 2. Reset Pagination on Filter Changes

```typescript
useEffect(() => {
  pagination.reset();
}, [filters, pagination.reset]);
```

### 3. Handle Empty States

```typescript
if (data?.items.length === 0) {
  return <EmptyState message="No users found" />;
}
```

### 4. Combine Filters with AND Logic

```typescript
const filters = [];
if (input?.status) filters.push(eq(users.status, input.status));
const baseCondition = filters.length > 1 ? and(...filters) : filters[0];
```

## Implementation Checklist

**Backend:**

- [ ] Define sort columns in schema
- [ ] Create pagination input schema with `basePaginationInputSchema`
- [ ] Add `sortableColumns` mapping in repository
- [ ] Initialize `CursorPagination` in constructor
- [ ] Implement find method using `pagination.paginate()`
- [ ] Create tRPC endpoint with schema

**Frontend:**

- [ ] Use `useCursorPagination` hook
- [ ] Add tRPC query with pagination params
- [ ] Reset pagination when filters change
- [ ] Add `PaginationControls` component
- [ ] Handle loading/empty states

## Performance

- Add database indexes on sortable columns
- Use `$dynamic()` for dynamic queries
- Consider virtual scrolling for large datasets
