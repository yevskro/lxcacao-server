module.exports = {
  extends: 'airbnb',
  env: {
    node: true,
    es6: true,
    jest: true
  },
  rules: {
    'implicit-arrow-linebreak': 'off',
    'comma-dangle': 'off',
    indent: 'off',
    'no-trailing-spaces': 'off',
  },
  plugins: ['@typescript-eslint']
};
