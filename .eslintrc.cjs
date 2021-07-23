module.exports = {
  plugins: [
    '@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    // 'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
  },
  rules:{
    'strict': 'off',
    'prefer-promise-reject-errors': ['error', {'allowEmptyReject': true}],
  },
};
