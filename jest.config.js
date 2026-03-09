/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@languages/(.*)$': '<rootDir>/src/languages/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    'react-native-gifted-charts': '<rootDir>/__tests__/mocks/react-native-gifted-charts.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/config/plugins/**',
    '!src/languages/i18n/index.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 15,
      functions: 5,
      branches: 2,
      statements: 15,
    },
  },
  testPathIgnorePatterns: ['/node_modules/', '__tests__/setup.tsx', '__tests__/mocks/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@gorhom/bottom-sheet)',
  ],
};
