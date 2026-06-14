import { test, expect } from '@playwright/test'

const SCHEDULE_URL = process.env.SCHEDULE_URL || 'http://localhost:3001'

test.describe('Schedule App - E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SCHEDULE_URL)
  })

  test('app loads without crash', async ({ page }) => {
    await expect(page).toHaveTitle(/SVU|جدول|schedule/i)
  })

  test('shows landing page when not authenticated', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /جدول|schedule|دراسي/i }).first()
    await expect(heading).toBeVisible({ timeout: 5000 })
  })

  test('has Google login button', async ({ page }) => {
    const loginBtn = page.getByRole('button', { name: /google|جوجل|تسجيل الدخول/i }).first()
    await expect(loginBtn).toBeVisible()
  })

  test('shows auth loader while checking session', async ({ page }) => {
    await page.goto(SCHEDULE_URL)
    const loadingText = page.getByText(/loading|Loading|جارٍ|تحميل/i).first()
    await expect(loadingText).toBeVisible({ timeout: 5000 })
  })

  test('app footer is present', async ({ page }) => {
    const footer = page.getByText(/UniSync|SVU/i).last()
    await expect(footer).toBeVisible()
  })

  test('page has no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto(SCHEDULE_URL)
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 })
    expect(errors.length).toBe(0)
  })
})
