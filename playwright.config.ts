import { defineConfig, devices } from '@playwright/test'

const baseUrl = process.env.BASE_URL || 'http://localhost:5173'
const headless = process.env.HEADLESS !== 'false'

export default defineConfig({
  testDir: './apps/web/tests/e2e',
  fullyParallel: false,
  forbidOnly: !headless,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev:web',
    url: baseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
