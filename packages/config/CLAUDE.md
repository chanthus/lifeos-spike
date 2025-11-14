# Config Package (@project/config) - Claude Instructions

Shared configuration files for ESLint, Prettier, TypeScript, and Vitest.

## Critical Documentation References

**MUST READ before making changes:**

- **@/CLAUDE.md** - Root project rules (MANDATORY)
- **README.md** - Package-specific documentation

## Package Purpose

Centralized configuration management for:

- **ESLint** - Linting configurations for different environments
- **Prettier** - Code formatting configuration
- **TypeScript** - TypeScript compiler configurations
- **Vitest** - Test configuration

## Package Structure

```
config/
├── eslint/
│   ├── base/          # Base ESLint config
│   ├── nextjs/        # Next.js-specific config
│   ├── node/          # Node.js-specific config
│   └── react-native/  # React Native-specific config
├── prettier/
│   └── index.js       # Prettier configuration
├── typescript/
│   ├── base.json      # Base TypeScript config
│   ├── nextjs.json    # Next.js TypeScript config
│   ├── node.json      # Node.js TypeScript config
│   └── react-native.json  # React Native TypeScript config
└── vitest/
    └── index.ts       # Vitest configuration
```

## Configuration Usage

**ESLint:**

```javascript
// .eslintrc.js
module.exports = {
  extends: ['@project/config/eslint/nextjs'],
};
```

**TypeScript:**

```json
// tsconfig.json
{
  "extends": "@project/config/typescript/nextjs.json"
}
```

**Prettier:**

```javascript
// .prettierrc.js
module.exports = require('@project/config/prettier');
```

**Vitest:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import baseConfig from '@project/config/vitest';

export default defineConfig({
  ...baseConfig,
});
```

## Adding New Configurations

**Checklist:**

1. ✅ Identify the tool (ESLint, TypeScript, etc.)
2. ✅ Determine the environment (nextjs, node, react-native, base)
3. ✅ Create config file in appropriate directory
4. ✅ Extend base config when applicable
5. ✅ Document any special rules or settings
6. ✅ Test in target environment
7. ✅ Update README if needed
8. ✅ Run `pnpm check`

## Configuration Best Practices

**ESLint:**

- ✅ Extend base config
- ✅ Add environment-specific rules
- ✅ Document rule changes
- ✅ Keep configs minimal

**TypeScript:**

- ✅ Use strict mode
- ✅ Enable all type checking
- ✅ Extend base config
- ✅ Add path aliases when needed

**Prettier:**

- ✅ Keep simple and consistent
- ✅ Avoid excessive customization
- ✅ Follow team conventions

## Key Commands

```bash
pnpm lint                # Lint code
pnpm typecheck           # Type check
pnpm check               # Typecheck + lint + format (MANDATORY)
```

## Critical Rules

- **ALWAYS** read root @/CLAUDE.md
- **ALWAYS** extend base configs when creating environment-specific configs
- **ALWAYS** document significant rule changes
- **ALWAYS** test configurations in target environments
- **ALWAYS** keep configurations minimal and maintainable
- **ALWAYS** run `pnpm check` before completing tasks
- ONLY modify what is explicitly requested
- Preserve existing configuration patterns

## Examples

**Good Base Config Pattern:**

```javascript
// eslint/base/index.js
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    // Base rules that apply everywhere
  },
};
```

**Good Environment-Specific Config:**

```javascript
// eslint/nextjs/index.js
module.exports = {
  extends: ['../base', 'next/core-web-vitals'],
  rules: {
    // Next.js-specific rules
  },
};
```

## References

- **ESLint Configs**: `config/eslint/`
- **TypeScript Configs**: `config/typescript/`
- **Prettier Config**: `config/prettier/`
- **Vitest Config**: `config/vitest/`
