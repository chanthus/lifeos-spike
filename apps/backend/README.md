# @project/backend

Backend API Server powered by tRPC and Vite.

## Features

- 🚀 tRPC API server
- ⚡ Vite for fast development
- 🔒 CORS enabled
- 📦 TypeScript

## Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

```bash
PORT=43895
DB_HOST=localhost
DB_PORT=43891
DB_USER=postgres
DB_PASSWORD=
DB_NAME=postgres
CORS_ORIGIN=*
```

## API Endpoints

All tRPC procedures are available at `/trpc`

Example: `http://localhost:43895/trpc/user.me`
