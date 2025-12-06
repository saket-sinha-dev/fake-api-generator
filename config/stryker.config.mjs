// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'json'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  
  // Mutation configuration
  mutate: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/types.ts', // Type definitions
  ],

  // Files to include in mutation testing
  vitest: {
    configFile: './vitest.config.ts',
  },

  // TypeScript checker configuration
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',

  // Thresholds for mutation score
  thresholds: {
    high: 80,
    low: 60,
    break: 50, // Build will fail if mutation score is below this
  },

  // Ignore patterns
  ignorePatterns: [
    'node_modules',
    'dist',
    '.next',
    'coverage',
    'tests',
    'data',
    'public',
  ],

  // Timeout settings
  timeoutMS: 60000,
  timeoutFactor: 3,

  // Concurrency
  concurrency: 4,
  maxConcurrentTestRunners: 2,

  // Incremental mode (only mutate changed files)
  incremental: true,
  incrementalFile: '.stryker-tmp/incremental.json',

  // Mutation types to apply
  mutator: {
    plugins: [
      '@stryker-mutator/typescript-checker',
    ],
    excludedMutations: [
      'StringLiteral', // Avoid mutating string literals (too many false positives)
      'ObjectLiteral', // Avoid mutating object literals
    ],
  },

  // HTML report configuration
  htmlReporter: {
    fileName: 'reports/mutation/mutation-report.html',
  },

  // JSON report configuration
  jsonReporter: {
    fileName: 'reports/mutation/mutation-report.json',
  },

  // Logging
  // logLevel: 'info',
  // fileLogLevel: 'debug',

  // Disable clearing terminal
  clearTextReporter: {
    allowColor: true,
    logTests: false,
  },

  // Plugins
  plugins: [
    '@stryker-mutator/vitest-runner',
    '@stryker-mutator/typescript-checker',
  ],
};

export default config;
