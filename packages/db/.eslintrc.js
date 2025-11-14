/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [require.resolve('@project/config/eslint/node')],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: true,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
  },
};
