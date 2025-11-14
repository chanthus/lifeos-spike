# Admin App - Claude Instructions

Internal admin dashboard built with Next.js 15, React 18, and tRPC.

## Critical Documentation References

**MUST READ before making changes:**

- **@/CLAUDE.md** - Root project rules (MANDATORY)
- **@docs/frontend.md** - Frontend development patterns (MANDATORY)
- **@docs/type-reuse.md** - Type reuse patterns (CRITICAL - NEVER import from @project/shared or @project/db)
- **@docs/architecture.md** - System architecture overview
- **@docs/testing.md** - Testing philosophy

## App Purpose

Internal admin dashboard for managing data and operations. Not public-facing.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React Native Web + `@project/ui` (NativeWind v4 + React Native Reusables)
- **API Client**: tRPC (type-safe API calls)
- **Styling**: Tailwind CSS (via NativeWind v4)
- **Port**: 43894 (dev)

## Type Safety Rules

- ❌ **NEVER** use `any` type
- ✅ Use `unknown` for unknown types + type guards
- ✅ Let tRPC infer types automatically
- ✅ Extract explicit types only when needed (props, forms, utils)

## tRPC Integration Patterns

**Preferred: Automatic Type Inference**

```typescript
// ✅ GOOD: Let tRPC infer types
function PostList() {
  const { data, isLoading, error } = trpc.posts.list.useQuery({
    page: 1,
    limit: 20,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return <div>{data?.items.map((post) => <PostCard key={post.id} post={post} />)}</div>;
}
```

**Extract Types Only When Needed**

```typescript
import type { RouterOutput, RouterInput } from '@project/backend/client';

// For component props
type Post = RouterOutput['posts']['list']['items'][number];
type PostStatus = Post['status']; // ✅ Infer enum types from tRPC

// For forms
type CreatePostInput = RouterInput['posts']['create'];

interface PostCardProps {
  post: Post;
  status: PostStatus; // ✅ Uses inferred type
}
```

**CRITICAL: Type Inference Rules**

```typescript
// ❌ WRONG: NEVER import types from shared, db, or main backend
import type { PostStatus } from '@project/shared/types'; // ❌
import type { PostStatus } from '@project/db'; // ❌
import type { RouterOutput } from '@project/backend'; // ❌ Server-only!

// ✅ CORRECT: ALWAYS use /client and infer types from tRPC
import type { RouterOutput } from '@project/backend/client';
type Post = RouterOutput['posts']['list']['items'][number];
type PostStatus = Post['status']; // ✅ Inferred from tRPC
```

**Why /client?** The main `@project/backend` export contains server-only code (database, Node.js modules) that breaks browser builds. The `/client` export contains only frontend-safe types.

See **@docs/type-reuse.md** for complete pattern.

## Component Architecture

- Use functional components with TypeScript interfaces
- Follow single responsibility principle
- Implement proper loading and error states
- Use `React.memo` for performance optimization when needed
- Keep components small and focused

## Performance Optimization

**Hook Best Practices:**

- ✅ Use `useCallback` to memoize callbacks
- ✅ Use `useMemo` for expensive computations
- ✅ Use `React.memo` for component memoization
- ✅ Keep hook dependencies stable
- ❌ Don't optimize prematurely
- ❌ Don't create unstable dependencies

## Styling Guidelines

**CRITICAL: Use Tailwind CSS via className - NO inline styles**

### Core Principles

1. **className first** - ALWAYS use Tailwind utilities via `className` prop
2. **NO inline styles** - ❌ NEVER use `style={{...}}` prop
3. **Shared components** - Use components from `@project/ui` when possible
4. **Responsive design** - Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)

### Examples

```typescript
// ✅ GOOD: Use Tailwind classes via className
<div className="p-8 max-w-7xl mx-auto">
  <Text variant="h1" className="text-4xl font-bold mb-4 text-gray-900">
    Title
  </Text>
  <div className="flex gap-4 items-center">
    <Button variant="primary" className="px-4 py-2">Submit</Button>
  </div>
</div>

// ❌ WRONG: Using inline styles
<div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
  <Text variant="h1" style={{ fontSize: 36, fontWeight: 'bold' }}>
    Title
  </Text>
  <div style={{ display: 'flex', gap: '1rem' }}>
    <Button variant="primary" style={{ padding: '1rem' }}>Submit</Button>
  </div>
</div>
```

### Best Practices

- ✅ Use Tailwind utility classes for all styling
- ✅ Use `@project/ui` components which support className
- ✅ Use semantic color tokens (`text-gray-900`, `bg-blue-500`)
- ✅ Follow existing Tailwind patterns in the codebase
- ✅ Maintain responsive design with Tailwind breakpoints
- ❌ **NEVER** use inline `style={{...}}` prop
- ❌ **NEVER** create StyleSheet objects for web (Next.js apps)

## Key Commands

```bash
pnpm dev                 # Start dev server (port 43894)
pnpm build               # Build for production
pnpm start               # Start production server
pnpm lint                # Lint code
pnpm typecheck           # Type check
pnpm check               # Typecheck + lint + format (MANDATORY)
```

## Critical Rules

- **ALWAYS** read root @/CLAUDE.md and @docs/frontend.md
- **ALWAYS** check `@packages/ui` before creating new components
- **ALWAYS** use tRPC type inference by default
- **ALWAYS** run `pnpm check` before completing tasks
- ONLY modify what is explicitly requested
- Preserve existing code style and patterns
- Follow Next.js App Router conventions

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:43895  # Backend API URL
```

## References

- **UI Components**: Check `@packages/ui` first
- **tRPC Client**: `lib/trpc.ts`
- **tRPC Provider**: `lib/trpc-provider.tsx`
