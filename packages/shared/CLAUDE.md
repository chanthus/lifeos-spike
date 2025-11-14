# Shared Package (@project/shared) - Claude Instructions

Shared utilities, types, and constants used across the entire monorepo.

## Critical Documentation References

**MUST READ before making changes:**

- **@/CLAUDE.md** - Root project rules (MANDATORY)
- **@docs/type-reuse.md** - Type reuse patterns (CRITICAL for avoiding duplication)
- **@docs/architecture.md** - System architecture overview
- **@docs/testing.md** - Testing philosophy
- **README.md** - Package-specific documentation

## Package Purpose

Central repository for:

- **Types** - Shared TypeScript types and interfaces
- **Constants** - Application-wide constants
- **Utilities** - Pure utility functions (string, number, array, object, date)
- **Validation** - Zod schemas for common validations
- **Error Classes** - Custom error definitions

## Type Safety Rules

- ❌ **NEVER** use `any` type
- ✅ Use `unknown` for unknown types + type guards
- ✅ Use const assertions for literal types
- ✅ Export types and runtime values separately when needed

## Single Source of Truth Pattern

**CRITICAL: This package is the single source of truth for shared VALUES, not types.**

### For Enum Types (Database-backed)

**IMPORTANT**: For enum types that map to database columns, ONLY define the VALUES array here. The TYPE is defined in @project/db schema.

```typescript
// ✅ CORRECT: Define only the values array
/**
 * Post status values
 * Single source of truth for VALUES (array only)
 * The PostStatus TYPE is defined in @project/db schema
 */
export const POST_STATUSES = ['draft', 'published'] as const;

// ❌ WRONG: Do NOT export the type here
// export type PostStatus = (typeof POST_STATUSES)[number];  // This duplicates the db type
```

**Type Flow:**

- @project/shared: Exports VALUES array
- @project/db: Imports VALUES, creates pgEnum, exports TYPE
- @project/backend: Imports TYPE from @project/db
- Frontend apps: Infer TYPE from tRPC RouterOutput

See **@docs/type-reuse.md** for complete pattern.

### For Regular Types (Non-Enum)

```typescript
// ✅ GOOD: Regular types that don't map to database enums
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}
```

## Package Structure

```
src/
├── types/              # TypeScript types and interfaces
│   ├── common.ts       # Common types
│   ├── user.ts         # User-related types
│   ├── post.ts         # Post-related types
│   └── index.ts        # Barrel export
├── constants/          # Application constants
│   └── index.ts
├── utils/              # Pure utility functions
│   ├── string.ts       # String utilities
│   ├── number.ts       # Number utilities
│   ├── array.ts        # Array utilities
│   ├── object.ts       # Object utilities
│   ├── date.ts         # Date utilities
│   └── index.ts        # Barrel export
├── validation/         # Zod schemas
│   ├── common.ts       # Common validations
│   ├── user.ts         # User validations
│   └── index.ts        # Barrel export
├── errors/             # Custom error classes
│   └── index.ts
└── index.ts            # Main barrel export
```

## Adding New Shared Types

**Checklist:**

1. ✅ Create type file in `src/types/[domain].ts`
2. ✅ Use const assertions for literal types
3. ✅ Export both runtime values and types
4. ✅ Add JSDoc comments for complex types
5. ✅ Export from `src/types/index.ts`
6. ✅ Export from `src/index.ts` (if needed)
7. ✅ Run `pnpm check`

**Example:**

```typescript
// src/types/order.ts

/**
 * Order status values
 * Single source of truth for order status across the application
 */
export const ORDER_STATUSES = [
  'pending',
  'processing',
  'completed',
  'cancelled',
] as const;

/**
 * Order status type derived from ORDER_STATUSES
 */
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Order type definition
 */
export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: Date;
}
```

## Utility Function Guidelines

**Pure Functions Only:**

- ✅ No side effects
- ✅ Deterministic (same input = same output)
- ✅ Well-tested with unit tests
- ✅ Documented with JSDoc
- ✅ Handle edge cases

**Example:**

```typescript
/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

## Testing Requirements

**Unit Tests REQUIRED for:**

- ✅ All utility functions
- ✅ Complex type guards
- ✅ Validation schemas
- ✅ Error classes

```typescript
// src/utils/__tests__/string.test.ts
import { describe, it, expect } from 'vitest';
import { capitalize } from '../string';

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });
});
```

## Key Commands

```bash
pnpm build               # Build package
pnpm test                # Run unit tests
pnpm test:coverage       # Run tests with coverage
pnpm lint                # Lint code
pnpm typecheck           # Type check
pnpm check               # Typecheck + lint + format (MANDATORY)
```

## Critical Rules

- **ALWAYS** read root @/CLAUDE.md
- **ALWAYS** use const assertions for literal types
- **ALWAYS** write unit tests for utilities
- **ALWAYS** document public APIs with JSDoc
- **ALWAYS** use single source of truth pattern
- **ALWAYS** keep utilities pure (no side effects)
- **ALWAYS** run `pnpm check` before completing tasks
- ONLY modify what is explicitly requested
- Preserve existing patterns and structure

## Examples

**Good Examples in Codebase:**

- `src/types/post.ts` - Single source of truth for PostStatus
- `src/utils/string.ts` - Pure string utilities
- `src/validation/common.ts` - Reusable Zod schemas

## References

- **Types**: `src/types/`
- **Utils**: `src/utils/`
- **Validation**: `src/validation/`
