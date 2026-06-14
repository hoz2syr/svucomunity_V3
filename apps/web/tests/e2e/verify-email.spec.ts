import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Verify Email Page', () => {
  test('verify email page loads correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/verify-email.html`)
    await expect(page).toHaveTitle(/تأكيد|verify|البريد/i)
  })

  test('verify email page shows verification message', async ({ page }) => {
    await page.goto(`${BASE_URL}/verify-email.html`)
    const message = page.getByText(/تأكيد|verify|بريدك|email/i).first()
    await expect(message).toBeVisible()
  })

  test('verify email page has link to home', async ({ page }) => {
    await page.goto(`${BASE_URL}/verify-email.html`)
    const homeLink = page.getByRole('link', { name: /الرئيسية|home|الصفحه الرئيسية/i }).first()
    await expect(homeLink).toBeVisible()
  })
})
