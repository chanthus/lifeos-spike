Comprehensively audit the entire codebase to ensure all project rules are followed.

# Objective

Systematically verify that all code adheres to project rules documented in:

- Root @CLAUDE.md (global rules)
- @docs/architecture.md (architectural principles)
- @docs/backend.md (backend patterns)
- @docs/frontend.md (frontend patterns)
- @docs/testing.md (testing strategy)
- @docs/code-review.md (code review standards)
- @docs/audit-columns.md (audit column system)
- @docs/pagination.md (pagination patterns)
- @docs/type-reuse.md (type reuse patterns and frontend/backend boundary)
- @apps/backend/CLAUDE.md (backend app rules)
- @apps/web/CLAUDE.md (web app rules)
- @apps/admin/CLAUDE.md (admin app rules)
- @apps/mobile/CLAUDE.md (mobile app rules)
- @apps/marketing/CLAUDE.md (marketing site rules)

# Step 1: Parallel Agent Audit

Use multiple specialized agents in parallel to audit different areas:

**Backend Audit** (code-review-engineer):

- All files in `apps/backend/src/`
- Check against @docs/backend.md, @docs/architecture.md, @docs/audit-columns.md, @docs/pagination.md, @docs/type-reuse.md
- Verify: Feature-based architecture, DI pattern, BaseRepository usage, audit columns, transactions, error handling, TypeScript no-any rule, type reuse patterns

**Frontend Audit - Marketing** (code-review-engineer):

- All files in `apps/marketing/src/`
- Check against @docs/frontend.md, @apps/marketing/CLAUDE.md, @docs/type-reuse.md
- Verify: Component patterns, theming tokens, no-any rule, proper memoization, import from @project/backend/client only (if using tRPC)

**Frontend Audit - Web App** (code-review-engineer):

- All files in `apps/web/src/`
- Check against @docs/frontend.md, @apps/web/CLAUDE.md, @docs/type-reuse.md
- Verify: Component patterns, tRPC integration, hook usage, theming tokens, no-any rule, proper memoization, import from @project/backend/client only

**Frontend Audit - Admin App** (code-review-engineer):

- All files in `apps/admin/src/`
- Check against @docs/frontend.md, @apps/admin/CLAUDE.md, @docs/type-reuse.md
- Verify: Component patterns, tRPC integration, hook usage, theming tokens, no-any rule, proper memoization, import from @project/backend/client only

**Mobile App Audit** (code-review-engineer):

- All files in `apps/mobile/src/`
- Check against @docs/frontend.md, @apps/mobile/CLAUDE.md, @docs/type-reuse.md
- Verify: React Native patterns, component composition, proper TypeScript types, no-any rule, import from @project/backend/client only

**Shared UI Audit** (code-review-engineer):

- All files in `packages/ui/src/`
- Check against @docs/frontend.md (component composition, theming)
- Verify: Semantic color tokens, composition over configuration, proper TypeScript types

**Database Schema Audit** (code-review-engineer):

- All files in `packages/db/src/schema/`
- Check against @docs/backend.md, @docs/audit-columns.md
- Verify: UUID primary keys, audit columns, proper indexes, foreign key constraints

**Testing Audit** (qa-test-engineer):

- All test files across the codebase
- Check against @docs/testing.md
- Verify: Integration tests for all endpoints, co-located tests, proper test patterns, no disabled tests

# Step 2: Consolidate & Categorize Results

Group all findings into clear categories:

1. **Critical Issues** (🔴 Must fix - security, bugs, data integrity)
2. **Important Issues** (🟡 Should fix - performance, maintainability, missing tests)
3. **Suggestions** (🟢 Consider - improvements, best practices)

Within each severity level, organize by:

- TypeScript violations (any types, missing return types)
- Type reuse violations (wrong import boundaries, importing from @project/backend instead of /client)
- Architecture violations (wrong patterns, missing DI, missing BaseRepository, etc.)
- Component issues (theming, composition, performance)
- Database issues (missing audit columns, indexes, constraints)
- Testing gaps (missing integration tests, disabled tests)
- Code quality (dead code, console.logs, commented code)

# Step 3: Write Findings to Tracking File

Create a file named `.claude/audit/enforce-rules-YYYY-MM-DD.md` with:

- Summary of total issues by severity (🔴 Critical, 🟡 Important, 🟢 Suggestion)
- Issues grouped by category with checkboxes
- File paths and line numbers
- Specific rule violated with reference to documentation
- Suggested fix for each issue

Example format:

```markdown
# Project Rules Enforcement Report - 2025-01-15

## Summary

- 🔴 Critical: 5 issues
- 🟡 Important: 15 issues
- 🟢 Suggestions: 7 issues

## 🔴 Critical Issues

### TypeScript - No `any` Types (@CLAUDE.md, @docs/backend.md, @docs/frontend.md)

- [ ] `apps/backend/src/features/auth/auth.service.ts:28` - Using `any` for error param
  - Fix: Use `unknown` and type guard: `catch (error: unknown) { if (error instanceof Error) ... }`
- [ ] `apps/admin/src/components/UserForm.tsx:45` - Props type uses `any`
  - Fix: Extract proper type from RouterOutput: `import type { RouterOutput } from '@project/backend/client'; type User = RouterOutput['users']['get']`

### Architecture - Missing BaseRepository (@docs/backend.md)

- [ ] `apps/backend/src/features/orders/orders.repository.ts` - Not extending BaseRepository
  - Fix: `export class OrderRepository extends BaseRepository`

### Type Reuse - Frontend Importing from Wrong Backend Export (@docs/type-reuse.md)

- [ ] `apps/admin/src/lib/trpc.ts:3` - Importing from main backend export instead of /client
  - Fix: Change `import type { AppRouter } from '@project/backend'` to `import type { AppRouter } from '@project/backend/client'`
- [ ] `apps/web/src/pages/users.tsx:5` - Importing types from @project/db directly
  - Fix: Remove `import type { User } from '@project/db'` and infer from tRPC: `type User = RouterOutput['users']['get']`

## 🟡 Important Issues

### Frontend - Hardcoded Colors (@docs/frontend.md - Theming)

- [ ] `apps/admin/src/pages/Dashboard.tsx:67` - Using `bg-gray-800` instead of semantic tokens
  - Fix: Replace with `bg-background` and `text-foreground`
- [ ] `packages/ui/src/components/alert.tsx:12` - Dark mode manually handled
  - Fix: Use `bg-muted/50` instead of `bg-blue-50 dark:bg-blue-950`

### Testing - Missing Integration Tests (@docs/testing.md)

- [ ] `apps/backend/src/features/products/products.router.ts` - No test file
  - Fix: Create products.router.test.ts with integration tests for all endpoints

...
```

# Step 4: Interactive Fixing Workflow

- Show the tracking file location
- Ask the user how they want to proceed:
  1. **Fix all at once** - Run all fixes automatically
  2. **Fix by category** - Go through each category one by one
  3. **Fix by severity** - Fix all Critical, then Important, then Suggestions
  4. **Fix item by item** - Review and approve each individual fix
  5. **Ignore specific items** - Mark items to skip

After each fix:

- Check off the item in the tracking file using Edit tool: `- [ ]` → `- [x]`
- Update the summary counts
- Run `pnpm check` to verify no new issues
- Show progress (e.g., "Fixed 5/23 issues")
- Continue until all issues are resolved or user says stop

# Step 5: Progress Tracking

- Keep the tracking file updated as you work
- Mark completed items with `[x]`
- Update summary section with remaining counts
- If Claude Code restarts, read the tracking file to resume work

# Step 5: Verification

After all fixes:

- Run `pnpm check` to ensure everything passes
- Run `pnpm test` to ensure tests still pass
- Generate final summary of what was fixed

# Important Notes

- **DO NOT commit automatically** - NEVER create git commits without explicit user permission
- After fixing issues, ask the user if they want to commit the changes
- Only run git commands when the user explicitly requests it
- Use TodoWrite to track progress through issues
- Run agents in parallel for faster auditing
- Be thorough but pragmatic (focus on genuine violations, not nitpicking)
- Respect existing patterns (don't change just for change's sake)

$ARGUMENTS
