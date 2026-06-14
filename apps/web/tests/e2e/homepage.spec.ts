import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Homepage', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page).toHaveTitle(/SVU/i)
  })

  test('homepage has primary heading', async ({ page }) => {
    await page.goto(BASE_URL)
    const heading = page.getByRole('heading', { level: 1 }).first()
    await expect(heading).toBeVisible()
  })

  test('homepage has navigation links', async ({ page }) => {
    await page.goto(BASE_URL)
    const links = page.getByRole('link')
    await expect(links.first()).toBeVisible()
  })

  test('homepage has CTA button to get started', async ({ page }) => {
    await page.goto(BASE_URL)
    const cta = page.getByRole('button', { name: /سجل|register|ابدأ|login|دخول/i }).first()
    await expect(cta).toBeVisible()
  })
})
