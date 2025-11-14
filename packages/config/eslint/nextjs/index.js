/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    '../base-config.js',
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: '../tsconfig.json',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    // Enforce frontend/backend boundary - frontend must use /client exports
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@project/backend',
            message:
              'Frontend apps must import from "@project/backend/client" for browser-safe exports. The main backend export contains server-only code (database, Node.js modules) that will break browser builds.',
          },
          {
            name: '@project/backend/router',
            message:
              'Import AppRouter from "@project/backend/client" instead. This ensures you only get type exports without pulling in server code.',
          },
        ],
        patterns: [
          {
            group: ['@project/backend/*', '!@project/backend/client'],
            message:
              'Frontend apps must only import from "@project/backend/client". Avoid importing internal backend modules directly.',
          },
        ],
      },
    ],
  },
};
