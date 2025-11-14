# @project/web

Authenticated web application built with Next.js 15 and tRPC.

## Features

- 🔒 Authenticated pages
- 📡 tRPC client for API calls
- 🎨 Shared UI components
- ⚡ React Query for data fetching

## Development

```bash
pnpm dev    # Start dev server on http://localhost:43893
pnpm build  # Build for production
pnpm start  # Start production server
```

## Using tRPC

```tsx
'use client';

import { trpc } from '../lib/trpc';

export default function MyComponent() {
  const { data: user } = trpc.user.me.useQuery();
  const createUser = trpc.user.create.useMutation();

  return (
    <div>
      <p>{user?.name}</p>
      <button
        onClick={() =>
          createUser.mutate({
            /* data */
          })
        }
      >
        Create User
      </button>
    </div>
  );
}
```

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:43895/trpc
```
