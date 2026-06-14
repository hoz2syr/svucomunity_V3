import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Reset Password Page', () => {
  test('reset password page loads correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    await expect(page).toHaveTitle(/إعادة تعيين|reset|كلمة المرور/i)
  })

  test('reset password form has email field', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    await expect(page.getByLabel(/email|البريد/i).first()).toBeVisible()
  })

  test('reset password form has submit button', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    const submitBtn = page.getByRole('button', { name: /إرسال|send|reset|إعادة تعيين/i }).first()
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toBeEnabled()
  })

  test('reset password page has link to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    const loginLink = page.getByRole('link', { name: /تسجيل الدخول|login|عودة/i }).first()
    await expect(loginLink).toBeVisible()
  })
})
