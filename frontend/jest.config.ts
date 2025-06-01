import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // Test environment
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },

  // Module paths and resolution
  roots: ['<rootDir>/src'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  },

  // File patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/'
  ],

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setup/setupTests.ts',
    '<rootDir>/src/__tests__/setup/setupMocks.ts'
  ],
  setupFiles: [
    '<rootDir>/src/__tests__/setup/polyfills.ts'
  ],

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
          decorators: true
        },
        transform: {
          react: {
            runtime: 'automatic'
          }
        }
      }
    }],
    '^.+\\.css$': 'jest-transform-css',
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/': 'jest-transform-file'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@testing-library|@jest))'
  ],

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/setupTests.ts',
    '!src/**/__tests__/**',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/types/**',
    '!src/assets/**',
    '!src/public/**'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary', 'cobertura'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/utils/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/components/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/hooks/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/services/': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },

  // Test execution
  maxWorkers: '50%',
  testTimeout: 10000,
  resetMocks: true,
  restoreMocks: true,
  clearMocks: true,

  // Reporting
  verbose: false,
  silent: false,
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/coverage',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }],
    ['jest-html-reporter', {
      pageTitle: 'Podplay Sanctuary Test Report',
      outputPath: '<rootDir>/coverage/test-report.html',
      includeFailureMsg: true,
      includeSuiteFailure: true,
      includeConsoleLog: true
    }]
  ],

  // Watch mode
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '<rootDir>/.git/'
  ],

  // Global variables
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },

  // Module file extensions
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node'
  ],

  // Cache configuration
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',

  // Error handling
  errorOnDeprecated: true,
  bail: false,
  forceExit: false,

  // Test sequencing
  randomize: false,
  runInBand: false,

  // Snapshot configuration
  updateSnapshot: false,
  snapshotSerializers: [
    'enzyme-to-json/serializer'
  ],

  // Custom matchers and utilities
  testRunner: 'jest-circus/runner',
  
  // Performance monitoring
  logHeapUsage: false,
  detectOpenHandles: true,
  detectLeaks: false,

  // Project-specific configuration
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/__tests__/unit/**/*.test.{js,jsx,ts,tsx}']
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/src/**/__tests__/integration/**/*.test.{js,jsx,ts,tsx}']
    },
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/src/**/__tests__/e2e/**/*.test.{js,jsx,ts,tsx}'],
      testTimeout: 30000
    },
    {
      displayName: 'utils',
      testMatch: ['<rootDir>/src/**/__tests__/utils/**/*.test.{js,jsx,ts,tsx}']
    }
  ]
};

export default config;
