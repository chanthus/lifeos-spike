# @project/shared

Foundation package for the monorepo. Contains shared utilities, types, validation schemas, constants, and business logic.

## Key Principle

**This package has NO dependencies on other packages.** It is the foundation layer imported by ALL other packages and apps.

## Structure

```
src/
├── utils/          # Utility functions (date, string, array, object, number)
├── types/          # TypeScript types and interfaces
├── validation/     # Zod validation schemas
├── constants/      # Application-wide constants
├── errors/         # Custom error classes
└── index.ts        # Barrel exports
```

## Usage

### Utilities

```typescript
import { formatDate, capitalize, unique } from '@project/shared/utils';

formatDate(new Date()); // "Jan 1, 2024"
capitalize('hello'); // "Hello"
unique([1, 1, 2, 3]); // [1, 2, 3]
```

### Types

```typescript
import type { User, UserRole, Result } from '@project/shared/types';

const user: User = {
  id: '1',
  email: 'user@example.com',
  name: 'John Doe',
  role: UserRole.USER,
  // ...
};
```

### Validation

```typescript
import {
  emailSchema,
  passwordSchema,
  createUserSchema,
} from '@project/shared/validation';

const email = emailSchema.parse('user@example.com');
const userData = createUserSchema.parse({
  email: 'user@example.com',
  password: 'SecurePass123!',
});
```

### Constants

```typescript
import { APP_NAME, COLORS, MAX_FILE_SIZE } from '@project/shared/constants';

console.log(APP_NAME); // "MyApp"
console.log(COLORS.PRIMARY); // "#007AFF"
```

### Errors

```typescript
import { ValidationError, NotFoundError } from '@project/shared/errors';

throw new ValidationError('Invalid input', {
  email: ['Email is required'],
});

throw new NotFoundError('User not found', 'User');
```

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Test
pnpm test

# Test watch
pnpm test:watch

# Lint
pnpm lint
```

## Dependencies

This package depends on:

- `zod` - Schema validation

No other internal packages!

## Used By

- `@project/db`
- `@project/api`
- `@project/ui`
- `@project/backend`
- `@project/web`
- `@project/admin`
- `@project/mobile`
- `@project/marketing`
