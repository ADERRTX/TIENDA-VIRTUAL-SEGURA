/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!src/**/*.module.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text'],
  testTimeout: 30000,
  moduleNameMapper: {
    '^@tvs/shared/(.*)$': '<rootDir>/../shared/dist/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
  },
};