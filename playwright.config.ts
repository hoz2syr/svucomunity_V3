import { defineConfig, devices } from '@playwright/test'

const headless = process.env.HEADLESS !== 'false'

export default defineConfig({
  testDir: './apps/web/tests/e2e',
  fullyParallel: false,
  forbidOnly: !headless,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'web',
      testDir: './apps/web/tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEB_URL || 'http://localhost:5173',
      },
      webServer: {
        command: 'npm run dev:web',
        url: process.env.WEB_URL || 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
    },
    {
      name: 'courses',
      testDir: './apps/courses/tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.COURSES_URL || 'http://localhost:5173/courses',
      },
      webServer: {
        command: 'npm run dev:courses',
        url: process.env.COURSES_URL || 'http://localhost:5173/courses',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
    },
    {
      name: 'schedule',
      testDir: './apps/schedule/tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.SCHEDULE_URL || 'http://localhost:3001',
      },
      webServer: {
        command: 'npm run dev:schedule',
        url: process.env.SCHEDULE_URL || 'http://localhost:3001',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
    },
    {
      name: 'admin',
      testDir: './apps/admin/tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.ADMIN_URL || 'http://localhost:5173/admin',
      },
      webServer: {
        command: 'npm run dev:web',
        url: process.env.WEB_URL || 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
    },
  ],
})
