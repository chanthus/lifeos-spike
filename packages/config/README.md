# @project/config

Shared configuration files for the monorepo.

## Contents

- **TypeScript**: Base configurations for different environments
- **ESLint**: Linting rules for consistency
- **Prettier**: Code formatting rules
- **Vitest**: Test configuration helpers

## Usage

### TypeScript

```json
{
  "extends": "@project/config/typescript/base.json"
}
```

Available configs:

- `typescript/base.json` - Base TypeScript config
- `typescript/nextjs.json` - Next.js apps
- `typescript/react-native.json` - React Native/Expo apps
- `typescript/node.json` - Node.js packages

### ESLint

```js
module.exports = {
  extends: ['@project/config/eslint/base.js'],
};
```

Available configs:

- `eslint/base.js` - Base ESLint config
- `eslint/nextjs.js` - Next.js apps
- `eslint/react-native.js` - React Native/Expo apps
- `eslint/node.js` - Node.js packages

### Prettier

```js
module.exports = {
  ...require('@project/config/prettier'),
};
```

### Vitest

```ts
import { createVitestConfig } from '@project/config/vitest';

export default createVitestConfig({
  // Your custom config
});
```
