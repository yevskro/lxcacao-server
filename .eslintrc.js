module.exports = {
  extends: 'airbnb-typescript',
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
    es6: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  rules: {
    'implicit-arrow-linebreak': 'off',
    'comma-dangle': 'off',
    indent: 'off',
    'no-trailing-spaces': 'off'
  },
  plugins: ['@typescript-eslint']
};
