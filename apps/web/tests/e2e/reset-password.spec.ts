import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Reset Password Page - Comprehensive', () => {
  test('reset password page loads with correct title and RTL', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    await expect(page).toHaveTitle(/إعادة تعيين|reset.*password|تغيير/i)
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  })

  test('reset password form has new password field', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    const newPwField = page.getByLabel(/جديدة|new.*password|كلمة المرور الجديدة/i).first()
    await expect(newPwField).toBeVisible()
    await expect(newPwField).toHaveAttribute('type', 'password')
  })

  test('reset password form has confirm password field', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    const confirmField = page.getByLabel(/تأكيد|confirm|تأكيد كلمة المرور/i).first()
    await expect(confirmField).toBeVisible()
    await expect(confirmField).toHaveAttribute('type', 'password')
  })

  test('reset password form has submit button', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    const submitBtn = page.getByRole('button', { name: /تغيير|reset.*password|إعادة تعيين/i }).first()
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toBeEnabled()
  })

  test('shows error for empty new password', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    const submitBtn = page.getByRole('button', { name: /تغيير|reset|إعادة تعيين/i }).first()
    if ((await submitBtn.count()) > 0) {
      await submitBtn.click()
      const alert = page.getByRole('alert')
      await expect(alert).toBeVisible()
    }
  })

  test('shows error for mismatched passwords', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    const newPwField = page.getByLabel(/جديدة|new.*password/i).first()
    await newPwField.fill('newpassword123')

    const confirmField = page.getByLabel(/تأكيد|confirm/i).first()
    await confirmField.fill('differentpassword')

    const submitBtn = page.getByRole('button', { name: /تغيير|reset|إعادة تعيين/i }).first()
    if ((await submitBtn.count()) > 0) {
      await submitBtn.click()
      const alert = page.getByRole('alert')
      await expect(alert).toBeVisible()
    }
  })

  test('new password field has minlength attribute', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    const newPwField = page.getByLabel(/جديدة|new.*password/i).first()
    const minlength = await newPwField.getAttribute('minlength')
    expect(parseInt(minlength || '0')).toBeGreaterThanOrEqual(6)
  })

  test('CSP header is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    const csp = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      return meta?.getAttribute('content') || null
    })
    expect(csp).toBeTruthy()
  })

  test('no inline event handlers in reset form', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    const hasInline = await page.evaluate(() => {
      const form = document.getElementById('resetPasswordForm')
      if (!form) return false
      return ['onclick', 'onsubmit'].some(h => form.hasAttribute(h))
    })
    expect(hasInline).toBe(false)
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto(`${BASE_URL}/reset-password.html`)
    await expect(page.getByLabel(/جديدة|new.*password/i).first()).toBeVisible({ timeout: 10000 })
    expect(errors.length).toBe(0)
  })

  test('password toggle buttons are present', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    const toggleBtns = page.getByLabel(/إظهار|إخفاء|show|hide/i)
    const count = await toggleBtns.count()
    expect(count).toBeGreaterThan(0)
  })

  test('back to login link is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    const loginLink = page.getByRole('link', { name: /تسجيل الدخول|login|العودة/i }).first()
    await expect(loginLink).toBeVisible()
  })

  test('accepts valid password in new password field', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password.html`)
    const newPwField = page.getByLabel(/جديدة|new.*password/i).first()
    await newPwField.fill('newpass123')
    await expect(newPwField).toHaveValue('newpass123')
  })
})
