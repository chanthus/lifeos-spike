# Frontend Development Guidelines

Shared frontend development patterns for all React applications in the monorepo.

## Overview

The monorepo contains multiple React applications:

- **Marketing** (`apps/marketing/`) - Public marketing site (Next.js)
- **Web App** (`apps/web/`) - Customer-facing application (Next.js)
- **Admin App** (`apps/admin/`) - Internal dashboard (Next.js)
- **Mobile App** (`apps/mobile/`) - Mobile application (Expo/React Native)

All apps share common patterns, components, and conventions. App-specific overrides are in respective `apps/[app]/CLAUDE.md`.

## TypeScript Best Practices (MANDATORY)

### Core Type Safety Rules

- ❌ **NEVER** use `any` type
- ✅ Use `unknown` for truly unknown values, then narrow with type guards
- ✅ Use generics for reusable, type-safe components
- ✅ Leverage tRPC's automatic type inference
- ✅ Extract types from `RouterInput`/`RouterOutput` only when needed

## Component Architecture

### Core Principles

- Use functional components with TypeScript interfaces
- Follow single responsibility principle
- Prefer composition over configuration
- Implement proper error boundaries and loading states
- Use `React.memo` for performance optimization when needed

## Performance Optimization (MANDATORY)

**CRITICAL PRINCIPLE**: Use React hooks properly to avoid unnecessary re-renders.

### Required Hook Patterns

**1. `useCallback`** - Memoize callbacks to prevent child re-renders
**2. `useMemo`** - Memoize expensive computations
**3. `React.memo`** - Memoize components to prevent re-renders

### Best Practices

- ✅ Ensure all hook dependencies are stable
- ✅ Avoid creating new objects/functions in render
- ✅ Keep dependency arrays accurate
- ❌ Don't optimize prematurely
- ❌ Don't create unstable dependencies

## tRPC Integration Patterns

### Type Inference (CRITICAL)

**CORE PRINCIPLE**: Use automatic type inference by default. Only extract explicit types when needed.

### Option 1: Direct Type Inference (Preferred)

```typescript
// ✅ GOOD: Let tRPC infer types automatically
function UserList() {
  const { data, isLoading, error } = trpc.users.list.useQuery();
  //     ^? Automatically typed

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div>
      {data?.map(user => (
        <div key={user.id}>{user.name} - {user.email}</div>
      ))}
    </div>
  );
}
```

### Option 2: Extract Types When Needed

Use explicit types ONLY for:

- Component props
- Form types with react-hook-form
- Utility functions
- Type guards

```typescript
import type { RouterInput, RouterOutput } from '@project/backend/client';

// Extract output types for component props
type User = RouterOutput['users']['get'];
type UserListItem = RouterOutput['users']['list'][number];

// Extract input types for forms
type CreateUserInput = RouterInput['users']['create'];
```

## Styling

### Web Apps (web, admin, marketing)

- **Tailwind CSS** for styling (via NativeWind v4)
- **React Native Web** + `@project/ui` for components
- **NativeWind v4** - Primary styling approach (className prop)
- **React Native Reusables** - Accessible primitive components
- **Semantic color tokens**

### Mobile App

- **NativeWind v4** - Tailwind CSS for React Native (primary styling approach)
- **`className` prop** - Use Tailwind utilities via className
- **Shared UI components** from `@project/ui` package
- **React Native Reusables** - Accessible primitive components

### UI Component Library (`@project/ui`)

The `@project/ui` package provides cross-platform components that work on both web and mobile:

**Styling Stack:**

- **NativeWind v4** - Tailwind CSS for React Native
- **React Native Reusables** - Accessible, unstyled component primitives
- **Class Variance Authority (CVA)** - Component variant management
- **tailwind-merge + clsx** - Safe class merging with `cn()` utility

**Using Components:**

```typescript
import { Button, Card, Text } from '@project/ui';

// Components support className with Tailwind utilities
<Card className="p-4 bg-white rounded-lg shadow">
  <Text className="text-lg font-bold text-gray-900">Title</Text>
  <Button variant="primary" size="lg" className="mt-4 w-full">
    Submit
  </Button>
</Card>
```

**Creating New Components:**

1. **Check `@project/ui` first** - Reuse existing components when possible
2. **Use React Native Reusables primitives** - Build on accessible base components
3. **Style with NativeWind** - Use `className` with Tailwind utilities
4. **Use CVA for variants** - Define variants with Class Variance Authority
5. **Support both platforms** - Test on iOS, Android, and Web

**See** `@packages/ui/README.md` for comprehensive component library documentation.

### Styling Rules (MANDATORY)

**CRITICAL: Use NativeWind/Tailwind exclusively - NO inline styles**

1. **className first** - ALWAYS use Tailwind utilities via `className` prop
2. **NO inline styles** - ❌ NEVER use `style={{...}}` prop
3. **NO StyleSheet objects** - For Next.js apps, use Tailwind classes only
4. **Shared components** - Use components from `@project/ui` when possible
5. **Responsive design** - Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)

**Good Pattern:**

```typescript
// ✅ CORRECT: Tailwind classes via className
<div className="p-8 max-w-7xl mx-auto">
  <Text variant="h1" className="text-4xl font-bold mb-4 text-gray-900">
    Title
  </Text>
  <Button variant="primary" className="px-4 py-2">Submit</Button>
</div>
```

**Bad Pattern:**

```typescript
// ❌ WRONG: Using inline styles
<div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
  <Text variant="h1" style={{ fontSize: 36, fontWeight: 'bold' }}>
    Title
  </Text>
  <Button style={{ padding: '1rem' }}>Submit</Button>
</div>
```

## Critical Rules

- **ALWAYS** read root @CLAUDE.md for global rules
- Check `packages/ui` first before creating new components
- Use tRPC type inference by default
- Follow app-specific patterns from `apps/[app]/CLAUDE.md`
- Run `pnpm check` after changes
