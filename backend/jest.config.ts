import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  testEnvironment: 'node',
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testRunner: 'jest-jasmine2',
  coveragePathIgnorePatterns: ['dist', 'coverage', 'jest', 'migrations']
};
export default config;
