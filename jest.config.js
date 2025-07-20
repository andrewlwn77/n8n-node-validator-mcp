export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/build'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'build/**/*.js',
    '!build/**/*.d.ts',
    '!build/**/*.test.js',
    '!build/**/*.spec.js',
    '!build/index.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};