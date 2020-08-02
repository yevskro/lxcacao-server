module.exports = {
  extends: 'airbnb',
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
    es6: true,
    jest: true
  },
  rules: {
    'implicit-arrow-linebreak': 'off',
    'comma-dangle': 'off',
    indent: 'off',
    'no-trailing-spaces': 'off'
  },
  plugins: [
    '@typescript-eslint'
  ]
};
