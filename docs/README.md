# Documentation Structure

This document explains the documentation organization for the monorepo.

## Documentation Hierarchy

The documentation follows a **hierarchical structure** to eliminate duplication and maintain a single source of truth:

```
CLAUDE.md (Root)                    ← Global rules for entire monorepo
├── docs/                            ← Domain-specific documentation
│   ├── backend.md                   ← Backend development patterns
│   ├── frontend.md                  ← Shared frontend patterns
│   ├── testing.md                   ← Testing strategy & QA
│   ├── architecture.md              ← Architectural principles
│   └── code-review.md               ← Code review standards
├── apps/                            ← App-specific overrides
│   ├── marketing/CLAUDE.md          ← Marketing site specific rules
│   ├── web/CLAUDE.md                ← Web app specific rules
│   ├── admin/CLAUDE.md              ← Admin app specific rules
│   ├── backend/CLAUDE.md            ← Backend API specific rules
│   └── mobile/CLAUDE.md             ← Mobile app specific rules
└── .claude/agents/                  ← Agent wrappers (thin references)
    ├── backend-engineer.md          ← References docs/backend.md
    ├── frontend-engineer.md         ← References docs/frontend.md
    ├── qa-test-engineer.md          ← References docs/testing.md
    ├── code-review-engineer.md      ← References docs/code-review.md
    └── full-stack-architect.md      ← References docs/architecture.md
```

## Reading Order for Agents and Developers

### For Backend Work

1. @CLAUDE.md - Global rules
2. @docs/backend.md - Backend patterns (MANDATORY)
3. @apps/backend/CLAUDE.md - Backend API specific rules
4. @docs/testing.md - Testing requirements
5. @docs/architecture.md - Design principles

### For Frontend Work (Marketing Site)

1. @CLAUDE.md - Global rules
2. @docs/frontend.md - Shared frontend patterns (MANDATORY)
3. @apps/marketing/CLAUDE.md - Marketing site specific rules
4. @docs/testing.md - Testing requirements

### For Frontend Work (Web App)

1. @CLAUDE.md - Global rules
2. @docs/frontend.md - Shared frontend patterns (MANDATORY)
3. @apps/web/CLAUDE.md - Web app specific rules
4. @docs/testing.md - Testing requirements

### For Frontend Work (Admin App)

1. @CLAUDE.md - Global rules
2. @docs/frontend.md - Shared frontend patterns (MANDATORY)
3. @apps/admin/CLAUDE.md - Admin app specific rules
4. @docs/testing.md - Testing requirements

### For Mobile App Work

1. @CLAUDE.md - Global rules
2. @docs/frontend.md - Shared patterns (MANDATORY)
3. @apps/mobile/CLAUDE.md - React Native specific rules
4. @docs/testing.md - Testing requirements

### For Testing & QA

1. @CLAUDE.md - Global rules
2. @docs/testing.md - Testing strategy (MANDATORY)
3. @docs/backend.md - Backend patterns to test
4. @docs/frontend.md - Frontend patterns to test

### For Code Review

1. @CLAUDE.md - Global rules
2. @docs/code-review.md - Review standards (MANDATORY)
3. Domain-specific docs as needed (backend, frontend, testing, architecture)

### For Architecture & Planning

1. @CLAUDE.md - Global rules
2. @docs/architecture.md - Architectural principles (MANDATORY)
3. @docs/backend.md - Backend patterns to enforce
4. @docs/frontend.md - Frontend patterns to enforce
5. @docs/testing.md - Testing strategy to include
6. @docs/code-review.md - Review standards

## Key Principles

### 1. Single Source of Truth

Each rule is documented in ONE place only:

- **Global rules** → Root CLAUDE.md
- **Domain rules** → docs/[domain].md
- **App overrides** → apps/[app]/CLAUDE.md
- **Agent files** → Thin wrappers that reference docs

### 2. No Duplication

Instead of duplicating rules, documents **reference** each other:

- Agent files reference domain docs
- App-specific docs reference root and domain docs
- Domain docs reference root for global rules

### 3. Clear Hierarchy

Rules cascade with specificity:

1. **Root CLAUDE.md** - Applies to everything
2. **Domain docs** - Applies to specific domain (backend, frontend, etc.)
3. **App docs** - Overrides/additions for specific apps

### 4. Easy Maintenance

To update a rule:

1. Identify which level it belongs to (root, domain, or app)
2. Edit that ONE file
3. Changes automatically apply everywhere

## Document Purposes

### Root CLAUDE.md

- Global code modification rules
- Project overview and tech stack
- Common commands
- Co-location principles
- Before making ANY changes checklist

### docs/backend.md

- Database development (audit columns, BaseRepository, DI)
- Feature-based API development
- Repository, service, router patterns
- Error handling standards
- Performance & security

### docs/frontend.md

- Shared frontend patterns (all apps)
- Component architecture
- tRPC integration patterns
- Form handling with react-hook-form
- Styling with NativeWind v4 and React Native Reusables
- React Native patterns for mobile and web

### docs/testing.md

- Integration-first testing philosophy
- When to write integration vs unit tests
- Test structure and co-location
- Testing patterns for backend and frontend
- Quality standards

### docs/architecture.md

- Architectural principles (type safety, DI, feature-based)
- Design patterns (repository, service, factory, composition)
- Planning process for new features
- Decision-making framework
- Task delegation format

### docs/code-review.md

- Review process and severity levels
- Comprehensive checklist by domain
- Feedback format and communication style
- Project-specific rules to respect

### apps/marketing/CLAUDE.md

- Marketing site specific rules
- SEO optimization
- Performance priorities
- Static generation patterns

### apps/web/CLAUDE.md

- Web app specific rules (customer-facing)
- Routing with Next.js App Router
- Mobile-first responsive design
- Performance priorities

### apps/admin/CLAUDE.md

- Admin app specific rules (internal dashboard)
- Data-heavy interfaces (tables, charts)
- Desktop-first design
- Power user features

### apps/backend/CLAUDE.md

- Backend API specific rules
- Feature development workflow
- DI container usage
- Environment configuration
- Database optimization

### apps/mobile/CLAUDE.md

- React Native / Expo specific rules
- Native mobile patterns
- Offline-first considerations
- Platform-specific code

## Agent Files

Agent files in `.claude/agents/` are **thin wrappers** that:

1. Define the agent's role and description
2. Reference the comprehensive documentation
3. Provide critical reminders and quick patterns
4. Direct agents to read the full docs

**They should NOT contain detailed rules** - those live in the docs.

## Benefits of This Structure

### ✅ No Duplication

- Each rule exists in exactly one place
- Changes propagate automatically
- No risk of conflicting information

### ✅ Easy to Find

- Clear hierarchy makes it obvious where to look
- Consistent naming conventions
- Comprehensive README (this file)

### ✅ Easy to Maintain

- Edit rules in one place
- App-specific overrides clearly separated
- Agent files stay small and focused

### ✅ Works for Both Agents and Non-Agents

- Agents read domain docs directly
- Non-agent workflows use same docs
- Single source of truth for all

### ✅ Scalable

- Add new apps → Create apps/[app]/CLAUDE.md
- Add new domain → Create docs/[domain].md
- Add new agent → Create thin wrapper referencing docs

## Editing Guidelines

### To Add a Global Rule

1. Edit root `CLAUDE.md`
2. Applies to entire monorepo

### To Add a Domain-Specific Rule

1. Edit `docs/[domain].md`
2. Applies to that domain (backend, frontend, etc.)

### To Add an App-Specific Rule

1. Edit `apps/[app]/CLAUDE.md`
2. Only applies to that app

### To Update an Agent

1. Edit `.claude/agents/[agent].md` for role/description
2. Edit referenced docs for actual rules
