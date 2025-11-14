# Claude Assistant Instructions

This is the **root documentation** for the monorepo. All rules defined here apply globally across the entire codebase unless explicitly overridden in domain-specific documentation.

## Project Overview

A production-ready full-stack TypeScript monorepo for building cross-platform applications with:

- Type-safe APIs via tRPC
- Cross-platform UI with React Native Web + NativeWind v4
- PostgreSQL database with Drizzle ORM
- Next.js 15 for web and admin apps
- Expo SDK 52 for mobile app
- Shared UI components via `@project/ui` (React Native Reusables + NativeWind v4)

## Documentation Structure

- **This file (CLAUDE.md)**: Global rules and conventions for the entire monorepo
- **docs/**: Domain-specific guidelines organized by concern
  - @docs/architecture.md - Architectural principles and design patterns
  - @docs/backend.md - Backend development patterns and rules
  - @docs/frontend.md - Frontend development shared patterns
  - @docs/testing.md - Testing strategy and patterns
  - @docs/code-review.md - Code review standards and checklist
  - @docs/audit-columns.md - Audit column system and usage guide
  - @docs/pagination.md - Cursor-based pagination implementation guide
  - @docs/type-reuse.md - Type reuse patterns and frontend/backend boundary
- **App-Specific Documentation:**
  - @apps/backend/CLAUDE.md - Backend API specific rules
  - @apps/web/CLAUDE.md - Web app specific frontend rules
  - @apps/admin/CLAUDE.md - Admin app specific frontend rules
  - @apps/mobile/CLAUDE.md - Mobile app specific rules
  - @apps/marketing/CLAUDE.md - Marketing site specific rules
- **Package-Specific Documentation:**
  - @packages/db/CLAUDE.md - Database package specific rules
  - @packages/shared/CLAUDE.md - Shared utilities specific rules
  - @packages/ui/CLAUDE.md - UI components specific rules
  - @packages/config/CLAUDE.md - Configuration package rules

## IMPORTANT: Code Modification Rules

### DO NOT Make Unnecessary Changes

**MANDATORY**: When working on this codebase, you must follow these strict rules:

1. **ONLY fix what is explicitly requested** - Do not make "improvements" or "cleanups" that weren't asked for
2. **PRESERVE existing code style** - Do not reformat, reorganize, or refactor working code
3. **NO unsolicited changes** - Keep existing formatting, naming conventions, and patterns intact
4. **NO proactive "fixes"** - If it's not broken and not mentioned, don't touch it
5. **MAINTAIN exact functionality** - Do not add features or change behavior unless specifically requested
6. **CLAUDE AGENTS usage** - Always try to use the custom project agents when possible:
   - @full-stack-architect - For planning and designing complex features
   - @backend-engineer - For backend implementation
   - @frontend-web-engineer - For Next.js web frontend implementation (marketing, web, admin)
   - @frontend-mobile-engineer - For React Native/Expo mobile frontend implementation
   - @qa-test-engineer - For testing and quality assurance
   - @code-review-engineer - For code review (MANDATORY before completing work)

### When Making Changes:

- ✅ Fix ONLY the specific issue mentioned
- ✅ Preserve all surrounding code exactly as-is
- ✅ **ALWAYS run `pnpm check` after making changes**
- ✅ **Fix any linting and typecheck errors before considering the task complete**
- ❌ DO NOT refactor adjacent code
- ❌ DO NOT update dependencies without request
- ❌ DO NOT change existing variable names for "clarity"
- ❌ DO NOT add type annotations unless fixing a type error
- ❌ DO NOT randomly reorganize imports or file structure

### Git Commit Rules

**MANDATORY: Use git-commit-discipline skill for ALL commits**

Before ANY commit, you MUST:

1. **Invoke the Skill tool** with `git-commit-discipline` command
2. **Review actual changes** - Run `git status` and `git diff` (not conversation memory)
3. **Check recent commits** - Run `git log --oneline -5` to see commit style
4. **Write concise message** - Max 100 chars, explain WHY not WHAT, imperative mood
5. **Add attribution footer**:

   ```
   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

**Critical Rules:**

- ❌ **NEVER commit automatically** - Always ask the user before creating commits
- ❌ **NEVER commit based on conversation memory** - Always check actual file changes
- ❌ **NEVER write multi-paragraph commit messages** - Single line only
- ❌ **NEVER auto-commit after completing a task** - Wait for explicit user request
- ✅ Wait for explicit user approval before running git commit commands
- ✅ Present changes and get confirmation first

**Skill Location:** `.claude/skills/git-commit-discipline/SKILL.md`

### TypeScript Coding Rules (MANDATORY - Applies to ALL Code)

**Type Safety:**

- ❌ **NEVER** use `any` type - Use `unknown`, proper types, or generics instead
- ✅ Prefer type inference where TypeScript can determine types automatically
- ✅ Use union types, intersections, and generics for complex types
- ✅ Add explicit return types for exported functions
- ✅ Use `unknown` for truly unknown types, then narrow with type guards
- ✅ Use generics for flexible, reusable type-safe code

**Frontend Type Inference (CRITICAL):**

- ✅ **ALWAYS** import from `@project/backend/client` (frontend-safe exports)
- ❌ **NEVER** import from `@project/backend` (server-only code)
- ❌ **NEVER** import types from `@project/shared` or `@project/db` in frontend apps
- ✅ **ALWAYS** infer types from tRPC `RouterOutput` and `RouterInput`

See @docs/type-reuse.md for complete type reuse patterns and frontend/backend boundary enforcement.

### Commenting the Code

- **CRITICAL INSTRUCTION**: DO NOT add code comments unless absolutely necessary
- Prioritize clean, readable code over comments
- Consider comments as hacky ways to communicate with other developers
- Self-documenting code should be clear enough without needing explanatory comments. Comments should only be added when absolutely essential, not as a default practice.

## Clean Code Rules (MANDATORY - Applies to ALL Code)

Verify that all code follows clean code principles from:
https://gist.githubusercontent.com/wojteklu/73c6914cc446146b8b533c0988cf8d29/raw/c7a44d774fc3b09a0d5f0f58888550ba0ac694b9/clean_code.md

---

## Project Information

**IMPORTANT**: Read the [README.md](./README.md) file for complete project documentation including:

- Tech stack and architecture
- Setup instructions (both Nix and manual)
- Available commands
- Troubleshooting guide
- Project structure

## Quick Reference

This is a full-stack TypeScript monorepo application using:

- **Frontend**: Next.js 15 (web/admin), Expo (mobile)
- **Backend**: tRPC + Vite + Node.js (port 43895)
- **Database**: PostgreSQL with Drizzle ORM (port 43891 with Nix)
- **Package Manager**: pnpm (NOT npm or yarn)
- **Nix**: Recommended for reproducible development environment

## Key Commands for Development

```bash
# Development
pnpm dev              # Start all dev servers
pnpm dev:backend      # Backend only (port 43895)
pnpm dev:web          # Web only (port 43893)
pnpm dev:admin        # Admin only (port 43894)
pnpm dev:mobile       # Mobile only (Expo)

# Quality Checks (MANDATORY before completing work)
pnpm check            # Run typecheck + lint + format (recommended for validation)
pnpm fix              # Auto-fix all fixable issues
pnpm typecheck        # Check types only
pnpm lint             # Run ESLint only
pnpm format           # Auto-fix formatting issues

# Database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations (safe)
pnpm db:seed          # Seed database
pnpm db:studio        # Open Drizzle Studio

# Testing
pnpm test             # Run all tests (integration + unit)
pnpm test:coverage    # Run with coverage
```

## Code Organization & Co-location

### Feature-Based Structure (Co-location Pattern)

**IMPORTANT**: Always co-locate cohesive pieces together for better discoverability and maintenance.

#### Backend: Feature-Based Structure ✅

```
apps/backend/src/features/
  posts/                    # All post-related files together
    posts.router.ts         # tRPC router
    posts.router.test.ts    # Integration tests (co-located)
    posts.service.ts        # Business logic
    posts.schema.ts         # Zod validation schemas
    posts.repository.ts     # Data access layer (extends BaseRepository)
```

#### Frontend: Component Co-location ✅

```
packages/ui/src/components/
  button/                   # Component folder
    button.tsx              # Component implementation
    button.test.tsx         # Component tests
    index.ts                # Export barrel
```

### Co-location Principles

1. **Related Files Together**: Keep all files related to a feature/component in the same folder
2. **Tests Next to Code**: Co-locate tests with implementation files, not in separate directories
3. **Shared Utilities**: Only create shared folders for truly reusable utilities
4. **Avoid Deep Nesting**: Keep folder structures shallow and intuitive
5. **Consistent Naming**: Use consistent naming patterns across features

### Benefits of Co-location

- ✅ **Easier to Find**: Related code is in one place
- ✅ **Better Refactoring**: Changes are localized to one folder
- ✅ **Clearer Dependencies**: Imports show actual relationships
- ✅ **Faster Development**: Less context switching between folders
- ✅ **Better Maintenance**: All feature code evolves together

## Frontend/Backend Boundary (CRITICAL)

**MANDATORY:** Frontend apps MUST import from `@project/backend/client`, NOT the main export!

### The Problem

```typescript
// ❌ WRONG - This breaks in browsers!
import type { RouterOutput } from '@project/backend';
// This imports server-only code: database, Node.js modules, validation schemas
```

### The Solution

```typescript
// ✅ CORRECT - Frontend-safe imports
import type {
  AppRouter,
  RouterOutput,
  RouterInput,
} from '@project/backend/client';

// Infer types from tRPC
type Post = RouterOutput['posts']['list']['items'][number];
type PostStatus = Post['status']; // ✅ Inferred from tRPC
```

### ESLint Enforcement

ESLint will **error** if frontend apps try to import from the main backend export:

- ❌ `@project/backend` - **FORBIDDEN** in frontend
- ❌ `@project/backend/router` - **FORBIDDEN** in frontend
- ✅ `@project/backend/client` - **ONLY** allowed import

**See @docs/type-reuse.md** for complete frontend/backend boundary documentation.

## Important Notes

- **PostgreSQL Port**: 43891 (Nix) or 5432 (manual setup)
- **Environment Files**: Required in `apps/backend/`, `apps/web/`, `apps/admin/`, `apps/mobile/`
- **Primary Keys**: Always use UUIDs, not auto-increment
- **Package Manager**: Always use `pnpm`, never npm or yarn
- **Imports**: Use existing import patterns, don't reorganize
- **Audit Columns**: MANDATORY in all database tables (`...auditColumns`)
- **BaseRepository**: ALL repositories must extend BaseRepository
- **Integration Tests**: MANDATORY for all tRPC endpoints
- **UI Components**: ALWAYS check `@project/ui` before creating new components
- **Styling**: Use NativeWind v4 (Tailwind for React Native) for mobile, Tailwind CSS for web

## Common Tasks

### When User Asks to Fix a Bug

1. Identify the specific issue - ask for clarification if needed
2. Fix ONLY that issue
3. Test the fix works
4. Run `pnpm check` to ensure no regressions
5. Do NOT refactor surrounding code

### When User Asks to Add a Feature

1. Use @full-stack-architect agent to plan complex features
2. Implement ONLY what was requested
3. Follow existing patterns in the codebase
4. Add to existing files when possible (avoid creating new files)
5. Maintain the current code style
6. Hand over to @qa-test-engineer for testing
7. Hand over to @code-review-engineer for review

### When Working with Database

See @docs/backend.md and @packages/db/CLAUDE.md for complete database development patterns:

- Schema files are in `packages/db/src/schema/`
- After schema changes, run `pnpm db:generate` then `pnpm db:migrate`
- ALWAYS include audit columns in new tables (`...auditColumns`)
- ALWAYS extend BaseRepository for new repositories
- Audit context managed automatically via AsyncLocalStorage
- **Pagination**: See @docs/pagination.md for cursor-based pagination implementation

### When Working with Backend API

See @docs/backend.md and @apps/backend/CLAUDE.md for complete API development patterns:

- tRPC routers follow feature-based structure: `apps/backend/src/features/[feature]/[feature].router.ts`
- Use Zod schemas for input validation
- Follow DI pattern (services as singletons, repositories as request-scoped)
- Write integration tests for all endpoints (MANDATORY)
- Use TRPCError for proper error handling

### When Working with Frontend

See @docs/frontend.md and app-specific CLAUDE.md files:

- **ALWAYS** import from `@project/backend/client` (not main export)
- **ALWAYS** check `@project/ui` before creating new components
- Use tRPC hooks for type-safe API calls
- Infer types from `RouterOutput` and `RouterInput`
- Follow React best practices (hooks, memoization)
- Test on all target platforms (web, mobile if applicable)

### When Working with UI Components

See @packages/ui/README.md and @packages/ui/CLAUDE.md:

- **Check `@project/ui` first** - Reuse existing components when possible
- **Use NativeWind v4** - Style with Tailwind utilities via `className` prop
- **Build on React Native Reusables** - Use accessible primitive components as foundation
- **Use CVA for variants** - Define component variants with Class Variance Authority
- **Use `cn()` utility** - Safely merge Tailwind classes (tailwind-merge + clsx)
- **Support both platforms** - Components must work on iOS, Android, and Web
- **Test cross-platform** - Verify on all target platforms

## Before Making ANY Changes

Ask yourself:

1. Is this change explicitly requested?
2. Am I preserving the existing code style?
3. Am I only changing what needs to be changed?
4. Do I need integration tests for this change?
5. Have I read the relevant documentation?
6. Am I using the correct import boundaries?

If any answer is "no", reconsider the change.

## Domain-Specific Documentation

For detailed domain-specific rules and patterns, import and refer to:

- **Architecture & Design**: @docs/architecture.md
- **Backend Development**: @docs/backend.md
- **Frontend Development**: @docs/frontend.md
- **Testing & QA**: @docs/testing.md
- **Code Review**: @docs/code-review.md
- **Type Reuse & Boundaries**: @docs/type-reuse.md
- **Audit Columns**: @docs/audit-columns.md
- **Pagination**: @docs/pagination.md

These domain-specific documents contain detailed patterns, examples, and specialized knowledge for their respective areas.
