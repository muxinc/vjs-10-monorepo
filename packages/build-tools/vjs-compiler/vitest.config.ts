import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // Exclude E2E equivalence tests (run with Playwright instead)
    exclude: ['**/node_modules/**', 'test/e2e/equivalence/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/cli.ts'],
    },
  },
});
