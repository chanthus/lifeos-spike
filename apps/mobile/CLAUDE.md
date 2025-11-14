# Mobile App - Claude Instructions

Cross-platform mobile application built with React Native (Expo) and tRPC.

## Critical Documentation References

**MUST READ before making changes:**

- **@/CLAUDE.md** - Root project rules (MANDATORY)
- **@docs/frontend.md** - Frontend development patterns (MANDATORY)
- **@docs/type-reuse.md** - Type reuse patterns (CRITICAL - NEVER import from @project/shared or @project/db)
- **@docs/architecture.md** - System architecture overview
- **@docs/testing.md** - Testing philosophy

## See https://docs.expo.dev/llms.txt for details docs for ai models

## App Purpose

Cross-platform mobile application (iOS & Android).

## Tech Stack

- **Framework**: React Native 0.73 (Expo)
- **UI**: React Native components + `@packages/ui`
- **API Client**: tRPC (type-safe API calls)
- **Styling**: React Native StyleSheet
- **Navigation**: Expo Router (file-based routing)

## Type Safety Rules

- ❌ **NEVER** use `any` type
- ✅ Use `unknown` for unknown types + type guards
- ✅ Let tRPC infer types automatically
- ✅ Extract explicit types only when needed (props, forms, utils)

## tRPC Integration Patterns

**Preferred: Automatic Type Inference**

```typescript
import { trpc } from '../lib/trpc';

// ✅ GOOD: Let tRPC infer types
function PostList() {
  const { data, isLoading, error } = trpc.posts.list.useQuery({
    page: 1,
    limit: 20,
  });

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={data?.items}
      renderItem={({ item }) => <PostCard post={item} />}
      keyExtractor={(item) => item.id}
    />
  );
}
```

**Extract Types Only When Needed**

```typescript
import type { RouterOutput, RouterInput } from '@project/backend';

// For component props
type Post = RouterOutput['posts']['list']['items'][number];
type PostStatus = Post['status']; // ✅ Infer enum types from tRPC

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

**Why /client?** The main `@project/backend` export contains server-only code (database, Node.js modules) that breaks mobile builds. The `/client` export contains only frontend-safe types.

See **@docs/type-reuse.md** for complete pattern.

## Component Architecture

- Use functional components with TypeScript interfaces
- Follow single responsibility principle
- Implement proper loading and error states
- Use `React.memo` for list items and complex components
- Keep components small and focused

## Performance Optimization

**Critical for Mobile:**

- ✅ Use `FlatList` for long lists (not `ScrollView` with `.map()`)
- ✅ Implement proper list virtualization
- ✅ Use `React.memo` for list items
- ✅ Use `useCallback` for event handlers
- ✅ Optimize images (compress, use proper formats)
- ✅ Implement lazy loading where appropriate
- ❌ Avoid inline styles (extract to StyleSheet)

## Styling Guidelines

**CRITICAL: Use NativeWind v4 as the primary styling approach**

### Core Styling Principles

1. **className first** - Use Tailwind utilities via `className` prop (primary approach)
2. **Shared components** from `@project/ui` - Built with NativeWind v4 and React Native Reusables
3. **CVA for variants** - Use Class Variance Authority for component variants
4. **cn() for merging** - Use utility to safely merge Tailwind classes
5. **StyleSheet as fallback** - Use only when Tailwind can't achieve the result

### NativeWind v4 Usage

```typescript
import { View, Text } from 'react-native';

// ✅ GOOD: Use Tailwind utilities via className
export function MyScreen() {
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        Welcome
      </Text>
      <View className="bg-blue-500 p-4 rounded-lg shadow-lg">
        <Text className="text-white text-center">Card Content</Text>
      </View>
    </View>
  );
}
```

### Using UI Components from @project/ui

```typescript
import { Button, Card, Text } from '@project/ui';

// Components support className prop
export function MyFeature() {
  return (
    <Card className="p-6 bg-white">
      <Text className="text-lg font-bold mb-2">Title</Text>
      <Text className="text-gray-600 mb-4">Description here</Text>
      <Button variant="primary" size="lg" className="w-full">
        Submit
      </Button>
    </Card>
  );
}
```

### Tailwind Configuration

NativeWind is configured in `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{js,jsx,ts,tsx}', // Include UI package
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
};
```

### Platform-Specific Styling

```typescript
import { Platform } from 'react-native';
import { cn } from '@project/ui/lib';

<View className={cn(
  'p-4 rounded-lg',
  Platform.OS === 'ios' && 'shadow-lg',
  Platform.OS === 'android' && 'elevation-4'
)}>
  {/* Content */}
</View>
```

### Best Practices

- ✅ Use `className` with Tailwind utilities for all styling
- ✅ Check `@project/ui` before creating new components
- ✅ Use CVA for component variants
- ✅ Use `cn()` utility for conditional classes
- ✅ Test on both iOS and Android
- ✅ Ensure proper touch targets (44x44 minimum)
- ❌ **NEVER** use inline `style={{...}}` prop - use `className` instead
- ❌ **NEVER** use StyleSheet objects - use NativeWind `className` exclusively

## Key Commands

```bash
pnpm dev                 # Start Expo dev server (Metro bundler on port 43890)
pnpm android             # Run on Android
pnpm ios                 # Run on iOS
pnpm lint                # Lint code
pnpm typecheck           # Type check
pnpm check               # Typecheck + lint + format (MANDATORY)
```

**Note**: The dev server uses a wrapper script (`dev.sh`) that properly handles Ctrl+C cleanup of the Metro bundler on port 43890.

## Critical Rules

- **ALWAYS** read root @/CLAUDE.md and @docs/frontend.md
- **ALWAYS** check `@project/ui` before creating new components
- **ALWAYS** use NativeWind v4 `className` for styling (primary approach)
- **ALWAYS** use tRPC type inference by default
- **ALWAYS** test on both iOS and Android
- **ALWAYS** use FlatList for lists
- **ALWAYS** run `pnpm check` before completing tasks
- ONLY modify what is explicitly requested
- Preserve existing code style and patterns
- Follow React Native best practices

## Mobile-Specific Best Practices

- Optimize for touch interactions (proper touch targets)
- Handle keyboard properly (KeyboardAvoidingView)
- Implement proper error handling
- Test on different screen sizes
- Optimize bundle size
- Handle offline scenarios
- Implement proper navigation patterns

## Environment Variables

```bash
EXPO_PUBLIC_API_URL=http://localhost:43895/trpc  # Backend API URL
RCT_METRO_PORT=43890                            # Metro bundler port (default: 8081)
```

## References

- **UI Components**: `@project/ui` package (comprehensive component library)
- **NativeWind v4 Docs**: https://www.nativewind.dev/
- **React Native Reusables**: https://reactnativereusables.com/
- **tRPC Client**: `lib/trpc.ts`
- **Expo Router**: File-based routing in `app/` directory
- **Tailwind CSS**: https://tailwindcss.com/
