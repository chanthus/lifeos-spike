# @project/marketing

Public-facing marketing website built with Next.js 15.

## Features

- 📄 Static pages (Home, Features, Pricing)
- 📝 MDX blog support
- 🎨 Shared UI components
- 🔍 SEO optimized
- ⚡ Fast static generation

## Development

```bash
pnpm dev    # Start dev server on http://localhost:43892
pnpm build  # Build for production
pnpm start  # Start production server
```

## Structure

```
app/
├── layout.tsx      # Root layout
├── page.tsx        # Homepage
├── blog/           # Blog pages
└── features/       # Features page
```

## Adding Pages

Create new files in the `app/` directory:

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return <div>About Us</div>;
}
```

## Using Shared Components

```tsx
import { Button, Card, Text } from '@project/ui';

export default function Page() {
  return (
    <Card>
      <Text variant="h1">Hello</Text>
      <Button title="Click me" />
    </Card>
  );
}
```
