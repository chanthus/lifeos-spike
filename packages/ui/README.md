# @project/ui

Shared UI component library built with **React Native**, **NativeWind v4**, and **React Native Reusables**.

## Features

- 📱 Works on mobile (React Native)
- 🌐 Works on web (React Native Web)
- 🎨 Styled with **NativeWind v4** (Tailwind CSS for React Native)
- 🧩 Built on **React Native Reusables** primitives
- 🎯 TypeScript support
- 📦 Tree-shakeable exports
- ♿ Accessible components with proper ARIA support

## Tech Stack

- **React Native** - Cross-platform UI framework
- **React Native Web** - Run React Native on web
- **NativeWind v4** - Tailwind CSS for React Native
- **React Native Reusables** - Accessible, unstyled component primitives
- **Class Variance Authority (CVA)** - Component variant management
- **tailwind-merge + clsx** - Utility for merging Tailwind classes

## Components

All components support both `className` (Tailwind utilities) and `style` (React Native styles) props for maximum flexibility.

### Primitives (from React Native Reusables)

The UI package uses **React Native Reusables** primitives as the foundation for all components. These provide:

- ✅ Accessibility built-in (ARIA attributes, screen reader support)
- ✅ Keyboard navigation
- ✅ Unstyled base components
- ✅ Cross-platform compatibility (iOS, Android, Web)

Primitives are located in `src/primitives/` and include:

- Button
- Card
- Input
- Text
- And more...

### Styled Components

Components are styled using **NativeWind v4** and located in `src/components/`:

- `Button` - Customizable button with variants and sizes
- `Input` - Text input with label and error support
- `Card` - Container with elevation and border
- `Text` - Typography component with variants

## Usage

### Installing in Your App

The package is already installed in all apps via workspace dependencies.

```json
{
  "dependencies": {
    "@project/ui": "workspace:*"
  }
}
```

### Importing Components

```typescript
import { Button, Input, Card, Text } from '@project/ui';

function MyComponent() {
  return (
    <Card className="p-4">
      <Text className="text-lg font-bold">Welcome</Text>
      <Input label="Email" placeholder="Enter your email" />
      <Button className="mt-4">Submit</Button>
    </Card>
  );
}
```

## Styling with NativeWind v4

### Using className with Tailwind Utilities

```typescript
// Primary styling approach
<Button className="bg-blue-500 px-4 py-2 rounded-lg">
  Click Me
</Button>

// Combine with custom styles
<Card className="p-6 bg-white shadow-lg">
  <Text className="text-xl font-semibold text-gray-900">
    Title
  </Text>
</Card>
```

### Using CVA for Component Variants

Components use **Class Variance Authority (CVA)** for variant management:

```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'rounded-lg font-medium', // base styles
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
```

### Merging Classes with cn()

Use the `cn()` utility (tailwind-merge + clsx) to safely merge Tailwind classes:

```typescript
import { cn } from '@project/ui/lib';

<Button className={cn('bg-blue-500', isActive && 'bg-blue-700')}>
  Click Me
</Button>
```

## Component Examples

### Button

```typescript
<Button
  variant="primary"    // primary | secondary | outline | ghost
  size="md"            // sm | md | lg
  className="mt-4"     // Additional Tailwind classes
  onPress={() => {}}
>
  Click me
</Button>
```

### Input

```typescript
<Input
  label="Email"
  placeholder="Enter email"
  error="Email is required"
  value={email}
  onChangeText={setEmail}
  className="mb-4"
/>
```

### Card

```typescript
<Card className="p-4 bg-white rounded-lg shadow">
  <Text className="text-lg font-bold">Title</Text>
  <Text className="text-gray-600">Description here</Text>
</Card>
```

### Text

```typescript
<Text
  className="text-2xl font-bold text-gray-900"
>
  Hello World
</Text>
```

## Creating New Components

### Step 1: Create Primitive (if needed)

If the component doesn't exist in React Native Reusables, create a primitive in `src/primitives/`:

```typescript
// src/primitives/my-component/index.tsx
import { View } from 'react-native';

export function MyComponentPrimitive({ children, ...props }) {
  return <View {...props}>{children}</View>;
}
```

### Step 2: Style with NativeWind and CVA

```typescript
// src/components/MyComponent.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { MyComponentPrimitive } from '../primitives/my-component';

const myComponentVariants = cva(
  'rounded-lg', // base styles
  {
    variants: {
      variant: {
        default: 'bg-gray-100',
        primary: 'bg-blue-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface MyComponentProps extends VariantProps<typeof myComponentVariants> {
  className?: string;
  children: React.ReactNode;
}

export function MyComponent({ variant, className, children }: MyComponentProps) {
  return (
    <MyComponentPrimitive className={cn(myComponentVariants({ variant }), className)}>
      {children}
    </MyComponentPrimitive>
  );
}
```

### Step 3: Export Component

```typescript
// src/components/index.ts
export { MyComponent } from './MyComponent';
```

## Development

```bash
# Type check (no build needed - uses source files)
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format

# Test
pnpm test

# Clean build artifacts
pnpm clean
```

## NativeWind Configuration

NativeWind v4 is configured via `tailwind.config.js` at the root of each app:

```javascript
// apps/mobile/tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
};
```

## Used By

- `@project/mobile` - Expo mobile app (primary consumer)
- `@project/web` - Next.js web app (via React Native Web)
- `@project/admin` - Next.js admin dashboard (via React Native Web)
- `@project/marketing` - Next.js marketing site (selectively, via React Native Web)

## Resources

- **NativeWind v4 Docs**: https://www.nativewind.dev/
- **React Native Reusables**: https://reactnativereusables.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **CVA**: https://cva.style/docs
- **React Native**: https://reactnative.dev/
