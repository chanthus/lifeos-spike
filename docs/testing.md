# Testing Strategy & Guidelines

Testing philosophy and patterns for the monorepo.

## Testing Philosophy: Integration-First

**CORE PRINCIPLE**: Always prioritize integration tests over unit tests. Integration tests catch real-world bugs and provide confidence that features actually work for users.

### Test Priority Order

1. **🥇 Integration Tests (PRIORITY)** - Test complete workflows with real database
2. **🥈 Unit Tests (SUPPLEMENT)** - Only for complex business logic (>5 branches)
3. **🥉 E2E Tests (VALIDATION)** - Critical user journeys across the full stack

## When to Write Tests

### Integration Tests (MANDATORY)

**Required for:**

- ✅ ALL tRPC endpoints
- ✅ API workflows (auth, CRUD operations)
- ✅ Database operations (with real PostgreSQL)
- ✅ Error scenarios (validation, conflicts, authorization)

### Unit Tests (OPTIONAL)

**Only when:**

- ✅ Complex business logic (>5 conditions)
- ✅ Pure functions with complex calculations
- ✅ Utility functions used across features
- ✅ Edge cases hard to reproduce in integration tests

## Test Structure (Co-located)

```
src/features/users/
  users.router.ts
  users.router.test.ts     ← Integration tests (PRIORITY)
  users.service.ts
  users.service.test.ts    ← Unit tests (only if complex)
```

## Test Infrastructure

### Available Commands

```bash
pnpm test              # Run all tests (integration + unit)
pnpm test:unit         # Run only unit tests (fast, mocked)
pnpm test:coverage     # Run with coverage report
pnpm check             # Run typecheck + lint (MANDATORY before commit)
```

### Test Infrastructure Features

- **Real PostgreSQL database** - Isolated per worker, automatic cleanup
- **Parallel execution** - Each worker gets separate database on unique port
- **tRPC test caller** - Real router handlers, no mocking
- **Test file type checking** - Test files are fully type-checked alongside source code

### TypeScript Configuration for Tests

**CRITICAL**: Test files MUST be type-checked to catch errors early.

**DO NOT exclude test files from TypeScript:**

```json
// ❌ WRONG - Don't exclude test files
{
  "exclude": ["src/**/*.test.ts", "src/**/__tests__/**"]
}

// ✅ CORRECT - Include all TypeScript files
{
  "include": ["src/**/*.ts"]
}
```

**Why?** Excluding test files hides type errors in tests, leading to false positives in CI/CD and runtime errors. Always type-check test files.

## Quality Standards

**Integration Test Requirements:**

- ✅ No mocking of database or core infrastructure
- ✅ Test complete request/response cycles
- ✅ Verify database state after operations
- ✅ Cover error scenarios (validation, conflicts, auth)

**Code Quality:**

- ✅ **ALWAYS run `pnpm check`** after writing tests
- ✅ Co-locate tests with implementation
- ✅ Follow existing patterns in codebase
- ✅ NO unnecessary refactoring of working tests

## Anti-Patterns to Avoid

❌ Starting with unit tests (start with integration)
❌ Over-mocking (use real database/infrastructure)
❌ Testing implementation details (test behavior)
❌ Separate test directories (co-locate with code)
❌ Brittle tests (avoid testing internal state)

## Critical Rules

- **Integration tests MANDATORY** for all new features and API endpoints
- **Unit tests OPTIONAL** unless business logic is complex (>5 branches)
- **Co-locate tests** with implementation files
- **Use real database** for integration tests
- **Run `pnpm check`** before completing
