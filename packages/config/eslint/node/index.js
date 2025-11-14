/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    '../base-config.js',
    require.resolve('@vercel/style-guide/eslint/node'),
    require.resolve('@vercel/style-guide/eslint/typescript'),
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: '../tsconfig.json',
  },
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    'no-console': 'off',
  },
};
