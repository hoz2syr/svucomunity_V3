import { defineConfig, devices } from '@playwright/test'

const baseUrl = process.env.ADMIN_URL || 'http://localhost:5173/admin'
const headless = process.env.HEADLESS !== 'false'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
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
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
