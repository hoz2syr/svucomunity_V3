import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Verify Email Page - Comprehensive', () => {
  test('verify email page loads with correct title and RTL', async ({ page }) => {
    await page.goto(`${BASE_URL}/verify-email.html`)
    await expect(page).toHaveTitle(/تفعيل|verify|email/i)
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  })

  test('verify page shows loading state initially', async ({ page }) => {
    await page.goto(`${BASE_URL}/verify-email.html`)
    const loading = page.locator('#verifyLoading')
    await expect(loading).toBeVisible()
  })

  test('verify page has resend button', async ({ page }) => {
    await page.goto(`${BASE_URL}/verify-email.html`)
    const resendBtn = page.getByRole('button', { name: /إعادة إرسال|resend|resent/i }).first()
    await expect(resendBtn).toBeVisible()
  })

  test('verify page has back to home link', async ({ page }) => {
    await page.goto(`${BASE_URL}/verify-email.html`)
    const homeLink = page.getByRole('link', { name: /العودة للرئيسية|home/i }).first()
    await expect(homeLink).toBeVisible()
  })

  test('CSP header is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/verify-email.html`)
    const csp = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      return meta?.getAttribute('content') || null
    })
    expect(csp).toBeTruthy()
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto(`${BASE_URL}/verify-email.html`)
    await expect(page.locator('#verifyCard')).toBeVisible({ timeout: 10000 })
    expect(errors.length).toBe(0)
  })

  test('resend verification button is enabled', async ({ page }) => {
    await page.goto(`${BASE_URL}/verify-email.html`)
    const resendBtn = page.getByRole('button', { name: /إعادة إرسال|resend/i }).first()
    if ((await resendBtn.count()) > 0) {
      await expect(resendBtn).toBeEnabled()
    }
  })

  test('back to home link navigates correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/verify-email.html`)
    const homeLink = page.getByRole('link', { name: /العودة للرئيسية|home/i }).first()
    if ((await homeLink.count()) > 0) {
      await homeLink.click()
      await expect(page).toHaveURL(/index\.html|\/$/)
    }
  })
})
