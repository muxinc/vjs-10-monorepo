import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../tests',
  testMatch: '**/*.spec.ts',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5175',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run dev server before tests
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5175/src/react/01-minimal.html', // Check actual page instead of root
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes for compilation + startup
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
