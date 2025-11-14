# Monorepo

Production-ready monorepo for building cross-platform applications with TypeScript, tRPC, Next.js, Expo, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- **Nix** with flakes enabled ([Install Nix](https://zero-to-nix.com/start/install))
- **direnv** for automatic environment loading

```bash
# Install direnv (macOS)
brew install direnv

# Add to shell (zsh)
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
source ~/.zshrc

# Allow direnv in project
cd /path/to/project
direnv allow
```

### Setup & Run

```bash
# 1. Install dependencies (direnv loads Nix environment automatically)
pnpm install

# 2. Create .env files from .env.example (only creates if missing)
pnpm env:setup

# 3. Start PostgreSQL
pnpm infra

# 4. Setup database
pnpm db:migrate
pnpm db:seed

# 5. Start all apps
pnpm dev
```

**What happens:**

- `direnv allow` → Automatically loads Nix environment when entering project
- `pnpm env:setup` → Creates .env files from .env.example (skips if .env already exists)
- `pnpm infra` → Starts PostgreSQL on port 43891
- `pnpm db:migrate` → Runs database migrations
- `pnpm dev` → Starts all apps (backend, web, admin, mobile, marketing)

See the **Configuration** section below for all service URLs and ports.

## 📦 Structure

```
project/
├── apps/
│   ├── backend/        # tRPC API (Vite + Node.js)
│   ├── marketing/      # Marketing site (Next.js 15)
│   ├── web/            # Web app (Next.js 15 + tRPC)
│   ├── admin/          # Admin dashboard (Next.js 15 + tRPC)
│   └── mobile/         # Mobile app (Expo SDK 52 + tRPC)
├── packages/
│   ├── config/         # Shared configs (ESLint, TypeScript, Tailwind)
│   ├── shared/         # Utils, types, validation
│   ├── db/             # Drizzle ORM + PostgreSQL
│   └── ui/             # Cross-platform UI (NativeWind v4 + React Native Reusables)
└── docs/               # Development docs
```

## 🛠️ Tech Stack

- **Monorepo:** pnpm + Turborepo
- **Language:** TypeScript
- **Backend:** Node.js + Vite + tRPC 11
- **Database:** PostgreSQL + Drizzle ORM
- **Web/Admin:** Next.js 15 (App Router) + Tailwind CSS
- **Mobile:** Expo SDK 52 + Expo Router
- **UI Components:** React Native Web + NativeWind v4 + React Native Reusables
- **Styling:** Tailwind CSS (Web) + NativeWind v4 (Mobile)
- **Testing:** Vitest

## 📝 Commands

```bash
# Infrastructure
pnpm infra            # Start PostgreSQL (port 43891)
pnpm infra:stop       # Stop PostgreSQL

# Development
pnpm dev              # Start all apps
pnpm dev:backend      # Backend only (port 43895)
pnpm dev:web          # Web only (port 43893)
pnpm dev:admin        # Admin only (port 43894)
pnpm dev:mobile       # Mobile only (Metro: 43890)
pnpm dev:marketing    # Marketing only (port 43892)

# Database
pnpm db:generate      # Generate migrations from schema changes
pnpm db:migrate       # Apply migrations to database
pnpm db:push          # Push schema directly (dev only)
pnpm db:seed          # Seed database with sample data
pnpm db:studio        # Open Drizzle Studio GUI

# Quality Checks
pnpm check            # Run typecheck + lint + format check
pnpm fix              # Auto-fix linting and formatting issues
pnpm test             # Run all tests
pnpm test:coverage    # Run tests with coverage report
pnpm typecheck        # Type check only
pnpm lint             # Lint only
pnpm format           # Format code

# Build
pnpm build            # Build all apps and packages
pnpm build:packages   # Build packages only
pnpm build:apps       # Build apps only

# Cleanup
pnpm clean            # Clean all build artifacts
pnpm killall          # Kill all dev servers on all ports
```

## 🎯 Key Features

### Type-Safe API with tRPC

```typescript
// Backend
export const userRouter = router({
  getById: publicProcedure.input(z.string()).query(({ input }) => {
    return db.query.users.findFirst({ where: eq(users.id, input) });
  }),
});

// Frontend - fully typed, no code generation
const { data: user } = trpc.user.getById.useQuery('123');
```

### Cross-Platform UI with NativeWind v4

```typescript
import { Button, Card, Text } from '@project/ui';

// Works on iOS, Android, AND web with Tailwind styling
function MyComponent() {
  return (
    <Card className="p-6 bg-white rounded-lg shadow-lg">
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        Hello World
      </Text>
      <Button variant="primary" size="lg" className="w-full">
        Click me
      </Button>
    </Card>
  );
}
```

**Centralized Tailwind Configuration:**

- Shared preset in `packages/config/tailwind/`
- All apps use the same design tokens and utilities
- NativeWind v4 enables `className` prop for React Native components

### Database-per-Worker Testing

```typescript
// Each Vitest worker gets its own database
// Tests run in parallel across files
describe('User tests', () => {
  it('creates a user', async () => {
    // Uses test_worker_1, test_worker_2, etc.
  });
});
```

## 📖 Documentation

Comprehensive development guidelines in the `docs/` directory:

- **[docs/architecture.md](./docs/architecture.md)** - Architectural principles
- **[docs/backend.md](./docs/backend.md)** - Backend development patterns
- **[docs/frontend.md](./docs/frontend.md)** - Frontend development patterns
- **[docs/testing.md](./docs/testing.md)** - Testing strategy
- **[docs/type-reuse.md](./docs/type-reuse.md)** - Type reuse patterns
- **[docs/pagination.md](./docs/pagination.md)** - Cursor-based pagination

## 🔧 Configuration

### Ports

All development servers use ports starting with `4389`:

| Service    | Port  | URL                    |
| ---------- | ----- | ---------------------- |
| PostgreSQL | 43891 | http://localhost:43891 |
| Marketing  | 43892 | http://localhost:43892 |
| Web        | 43893 | http://localhost:43893 |
| Admin      | 43894 | http://localhost:43894 |
| Backend    | 43895 | http://localhost:43895 |
| Mobile     | 43890 | Metro bundler (Expo)   |

### Database

- **Connection:** `postgresql://postgres@localhost:43891/postgres`
- **No password required** (local development with Nix)
- **Managed via:** `pnpm infra` (start) and `pnpm infra:stop` (stop)

### Environment Variables

Automatically set by direnv when entering the project directory.

## 🐛 Troubleshooting

**iOS Simulator not starting:**

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

**PostgreSQL connection issues:**

```bash
pnpm infra:stop  # Stop existing instance
pnpm infra       # Start fresh instance
```

**Port conflicts:**

```bash
pnpm killall     # Kill all dev servers on ports 43890-43896
```

## 📄 License

MIT

---

Built with ❤️ for rapid cross-platform development
