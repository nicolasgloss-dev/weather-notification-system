/** 
 * Jest configuration for the Weather Notification System project.
 * This setup allows testing of CDK stacks and Lambda TypeScript code.
 * Using ts-jest lets Jest understand TypeScript files directly.
 */

module.exports = {
  // Use ts-jest to compile TypeScript files before running tests.
  preset: 'ts-jest',

  // Tell Jest to treat this as a Node.js project (not browser-based).
  testEnvironment: 'node',

  // Match only test files inside the /test directory that end with .test.ts.
  testMatch: ['**/test/**/*.test.ts'],

  // These options make the output a bit clearer when reading results.
  verbose: true,
  clearMocks: true,

  // TypeScript diagnostics configuration to reduce noisy warnings.
  globals: {
    'ts-jest': {
      diagnostics: {
        // 151002 warning happens when using hybrid module kinds.
        // It’s safe to ignore for CDK projects.
        ignoreCodes: [151002],
      },
    },
  },

  // Coverage is optional but useful when testing Lambda logic.
  collectCoverage: false,
};
