module.exports = {
  moduleFileExtensions: ['ts', 'js', 'jsx', 'tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/tables/', '/models/']
};
