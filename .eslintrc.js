/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [require.resolve('/config/eslint/base')],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    '.expo/',
    'coverage/',
    'drizzle/',
    '.postgres-data/',
  ],
};
