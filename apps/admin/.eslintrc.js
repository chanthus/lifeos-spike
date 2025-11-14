/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [require.resolve('@project/config/eslint/nextjs')],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: true,
  },
};
