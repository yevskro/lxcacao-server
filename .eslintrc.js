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
    'no-trailing-spaces': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
        mjs: 'never'
      }
    ]
  },
  settings: {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  plugins: ['@typescript-eslint']
};
