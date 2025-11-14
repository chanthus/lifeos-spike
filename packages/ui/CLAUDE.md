# UI Package (@project/ui) - Claude Instructions

Cross-platform UI component library for React and React Native built with **NativeWind v4** and **React Native Reusables**.

## Critical Documentation References

**MUST READ before making changes:**

- **@/CLAUDE.md** - Root project rules (MANDATORY)
- **@docs/frontend.md** - Frontend development patterns
- **README.md** - Package-specific documentation (comprehensive guide)

## Package Purpose

Shared UI component library providing:

- **Cross-platform components** - Work on Web (React Native Web) and Mobile (React Native)
- **Styled with NativeWind v4** - Tailwind CSS for React Native
- **Built on React Native Reusables** - Accessible, unstyled primitives
- **Design system** - Consistent UI/UX across all apps

## Tech Stack

- **Framework**: React 18 + React Native 0.76 + React Native Web
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **Primitives**: React Native Reusables (accessible, unstyled components)
- **Variants**: Class Variance Authority (CVA)
- **Utilities**: tailwind-merge + clsx for class merging
- **Build**: TypeScript (source-only, no build step)

## Type Safety Rules

- ❌ **NEVER** use `any` type
- ✅ Use `unknown` for unknown types + type guards
- ✅ Use generics for reusable components
- ✅ Define strict prop interfaces

## Component Development Guidelines

**Cross-Platform First:**

- ✅ Support both React and React Native
- ✅ Use platform-specific code when needed
- ✅ Test on web, iOS, and Android
- ✅ Follow React Native best practices

**Example Component:**

```typescript
import type { ReactNode } from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import type { TextStyle } from 'react-native';

export interface TextProps {
  children: ReactNode;
  variant?: 'body' | 'heading' | 'caption';
  style?: TextStyle;
}

export function Text({ children, variant = 'body', style }: TextProps) {
  return <RNText style={[styles[variant], style]}>{children}</RNText>;
}

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
});
```

## Component Checklist

When adding a new component:

1. ✅ Create component in `src/components/[ComponentName].tsx`
2. ✅ Define TypeScript interface for props
3. ✅ Ensure cross-platform compatibility
4. ✅ Add JSDoc comments
5. ✅ Export from `src/components/index.ts`
6. ✅ Export from `src/index.ts`
7. ✅ Test on web and mobile
8. ✅ Run `pnpm check`

## Styling Guidelines

**CRITICAL: Use NativeWind v4 with Tailwind CSS as the primary styling approach**

### Core Principles

1. **className first** - Use Tailwind utilities via `className` prop
2. **CVA for variants** - Use Class Variance Authority for component variants
3. **cn() for merging** - Use `cn()` utility (tailwind-merge + clsx) to merge classes safely
4. **style as fallback** - Support `style` prop for edge cases, but prefer `className`

### Primary Styling Pattern

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { View } from 'react-native';

// 1. Define variants with CVA
const cardVariants = cva(
  'rounded-lg border border-border bg-card', // base styles
  {
    variants: {
      variant: {
        default: 'shadow-sm',
        elevated: 'shadow-lg',
      },
      padding: {
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

// 2. Create component with variant props
interface CardProps extends VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, variant, padding, className }: CardProps) {
  return (
    <View className={cn(cardVariants({ variant, padding }), className)}>
      {children}
    </View>
  );
}
```

### Using Tailwind Utilities

```typescript
// ✅ GOOD: Use Tailwind utilities
<Card className="bg-white p-4 rounded-lg shadow">
  <Text className="text-lg font-bold text-gray-900">Title</Text>
  <Text className="text-sm text-gray-600">Description</Text>
</Card>

// ✅ GOOD: Combine with variants
<Button variant="primary" size="lg" className="mt-4 w-full">
  Submit
</Button>

// ⚠️ AVOID: Using style prop (use only when Tailwind can't achieve the result)
<View style={{ backgroundColor: '#custom' }}>
  {/* Better to extend Tailwind config with custom colors */}
</View>
```

### React Native Reusables Integration

Components should be built on top of React Native Reusables primitives:

```typescript
// src/primitives/button/index.tsx (from React Native Reusables)
import { Pressable } from 'react-native';

export function ButtonPrimitive({ children, ...props }) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessible={true}
    >
      {children}
    </Pressable>
  );
}

// src/components/Button.tsx (styled with NativeWind)
import { cva } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { ButtonPrimitive } from '../primitives/button';

const buttonVariants = cva(
  'rounded-lg font-medium items-center justify-center',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white',
        secondary: 'bg-gray-200 text-gray-900',
        outline: 'border border-blue-500 text-blue-500',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export function Button({ variant, size, className, children, ...props }) {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  );
}
```

## Package Structure

```
src/
├── components/         # UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Text.tsx
│   └── index.ts       # Barrel export
├── primitives/        # Base primitive components with CVA
│   ├── button/
│   ├── card/
│   ├── input/
│   └── text/
├── lib/               # Utilities
│   ├── cn.ts          # Class name utility (tailwind-merge + clsx)
│   └── index.ts
└── index.ts           # Main barrel export
```

## Component Best Practices

**Props:**

- ✅ Use TypeScript interfaces
- ✅ Provide sensible defaults
- ✅ Support style prop for customization
- ✅ Document with JSDoc

**Accessibility:**

- ✅ Add proper accessibility labels
- ✅ Support screen readers
- ✅ Ensure proper touch targets (44x44 minimum)
- ✅ Test with accessibility tools

**Performance:**

- ✅ Use `React.memo` for expensive components
- ✅ Avoid unnecessary re-renders
- ✅ Keep components lightweight
- ✅ Extract styles to StyleSheet

## Key Commands

```bash
pnpm typecheck           # Type check (no build needed - uses source files)
pnpm lint                # Lint code
pnpm format              # Format code
pnpm check               # Typecheck + lint + format (MANDATORY)
pnpm clean               # Clean build artifacts (if any)
```

## Resources

- **NativeWind v4**: https://www.nativewind.dev/
- **React Native Reusables**: https://reactnativereusables.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **CVA**: https://cva.style/docs
- **Components based off**: https://github.com/founded-labs/react-native-reusables/tree/main/packages/registry/src/new-york/components/ui

## Critical Rules

- **ALWAYS** read root @/CLAUDE.md and @docs/frontend.md
- **ALWAYS** ensure cross-platform compatibility (iOS, Android, Web)
- **ALWAYS** use NativeWind v4 `className` for styling (primary approach)
- **ALWAYS** build on React Native Reusables primitives for accessibility
- **ALWAYS** use CVA for component variants
- **ALWAYS** use `cn()` utility for merging Tailwind classes
- **ALWAYS** test on web and mobile platforms
- **ALWAYS** run `pnpm check` before completing tasks
- ONLY modify what is explicitly requested
- Preserve existing component patterns and styling approach

## References

- **Components**: `src/components/` - Styled components
- **Primitives**: `src/primitives/` - React Native Reusables base components
- **Utilities**: `src/lib/cn.ts` - Class merging utility
- **Examples**: Existing components (Button, Card, Input, Text)
