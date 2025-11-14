# Marketing App - Claude Instructions

Public marketing website built with Next.js 15 and React 18.

## Critical Documentation References

**MUST READ before making changes:**

- **@/CLAUDE.md** - Root project rules (MANDATORY)
- **@docs/frontend.md** - Frontend development patterns (MANDATORY)
- **@docs/type-reuse.md** - Type reuse patterns (for reference)
- **@docs/architecture.md** - System architecture overview

## App Purpose

Public-facing marketing website showcasing features, pricing, and documentation.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React Native Web + `@project/ui` (NativeWind v4 + React Native Reusables)
- **Styling**: Tailwind CSS (via NativeWind v4)
- **Port**: 43894 (dev)

## Type Safety Rules

- ❌ **NEVER** use `any` type
- ✅ Use `unknown` for unknown types + type guards
- ✅ Use TypeScript interfaces for props
- ✅ Use generics for reusable components

## Component Architecture

- Use functional components with TypeScript interfaces
- Follow single responsibility principle
- Keep components small and focused
- Optimize for SEO and performance
- Implement proper metadata for all pages

## Performance & SEO Optimization

**Critical for Marketing:**

- ✅ Optimize images (use Next.js Image component)
- ✅ Implement proper metadata and OpenGraph tags
- ✅ Use Static Site Generation (SSG) where possible
- ✅ Optimize Core Web Vitals
- ✅ Implement proper semantic HTML
- ✅ Add proper heading hierarchy (h1-h6)

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
- ✅ Optimize for all screen sizes
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
- **ALWAYS** optimize for SEO and performance
- **ALWAYS** run `pnpm check` before completing tasks
- **ALWAYS** implement proper metadata for new pages
- ONLY modify what is explicitly requested
- Preserve existing code style and patterns
- Follow Next.js App Router conventions

## SEO Best Practices

- Implement proper page titles and descriptions
- Use semantic HTML elements
- Optimize images with proper alt text
- Implement proper heading hierarchy
- Add structured data where appropriate
- Ensure mobile-friendly design

## References

- **UI Components**: Check `@packages/ui` first
- **Next.js Metadata**: Use App Router metadata API
- **Images**: Use Next.js Image component for optimization
