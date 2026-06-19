import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Register Page - Comprehensive', () => {
  test('register page loads with correct title and RTL', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    await expect(page).toHaveTitle(/تسجيل|register|إنشاء/i)
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', /ar|en/)
  })

  test('register form is visible and has all required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    const form = page.locator('#registerForm')
    await expect(form).toBeVisible()

    await expect(page.getByLabel(/username|اسم المستخدم|الاسم|البريد/i).first()).toBeVisible()
    await expect(page.getByLabel(/email|البريد/i).first()).toBeVisible()
    await expect(page.getByLabel(/password|كلمة المرور/i).first()).toBeVisible()
    await expect(page.getByLabel(/confirm|تأكيد|إعادة/i).first()).toBeVisible()
  })

  test('register form has submit button', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    const submitBtn = page.getByRole('button', { name: /إنشاء حساب|register|تسجيل/i }).first()
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toBeEnabled()
  })

  test('register page has link to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    const loginLink = page.getByRole('link', { name: /تسجيل الدخول|login|لديك حساب/i }).first()
    await expect(loginLink).toBeVisible()
    await expect(loginLink).toHaveAttribute('href', /login\.html/)
  })

  test('shows validation error for mismatched passwords', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    await page.getByLabel(/password|كلمة المرور/i).first().fill('password123')
    const confirmField = page.getByLabel(/confirm|تأكيد|إعادة/i).first()
    await confirmField.fill('different456')

    const submitBtn = page.getByRole('button', { name: /إنشاء حساب|register|تسجيل/i }).first()
    await submitBtn.click()

    const matchMsg = page.locator('#matchMsg')
    await expect(matchMsg).toBeVisible()
    await expect(matchMsg).toContainText(/غير متطابقة|mismatch|تأكيد/i)
  })

  test('shows validation error for empty required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    const submitBtn = page.getByRole('button', { name: /إنشاء حساب|register|تسجيل/i }).first()
    await submitBtn.click()

    const alerts = page.locator('[role="alert"]')
    const count = await alerts.count()
    expect(count).toBeGreaterThan(0)
  })

  test('username field accepts valid format', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    const usernameField = page.getByLabel(/username|اسم المستخدم/i).first()
    if ((await usernameField.count()) > 0) {
      await usernameField.fill('ahmed_123456')
      await expect(usernameField).toHaveValue('ahmed_123456')
    }
  })

  test('email input accepts valid format', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    const emailField = page.getByLabel(/email|البريد/i).first()
    await emailField.fill('test@example.com')
    await expect(emailField).toHaveValue('test@example.com')
  })

  test('password field has minlength of 8', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    const pw = page.getByLabel(/password|كلمة المرور/i).first()
    const minlength = await pw.getAttribute('minlength')
    expect(parseInt(minlength || '0')).toBeGreaterThanOrEqual(8)
  })

  test('terms checkbox is required', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    const termsCheckbox = page.getByLabel(/شروط|terms|أوافق/i).first()
    await expect(termsCheckbox).toBeVisible()
    await expect(termsCheckbox).toHaveAttribute('required')
  })

  test('CSP header is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    const csp = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      return meta?.getAttribute('content') || null
    })
    expect(csp).toBeTruthy()
  })

  test('no inline event handlers in register form', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    const hasInline = await page.evaluate(() => {
      const form = document.getElementById('registerForm')
      if (!form) return false
      return ['onclick', 'onsubmit'].some(h => form.hasAttribute(h))
    })
    expect(hasInline).toBe(false)
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto(`${BASE_URL}/register.html`)
    await expect(page.locator('#registerForm')).toBeVisible({ timeout: 10000 })
    expect(errors.length).toBe(0)
  })

  test('major input exists and is interactive', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    const majorInput = page.locator('#majorInput')
    await expect(majorInput).toBeVisible()
    await expect(majorInput).toBeEnabled()
  })

  test('login link navigates correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    const loginLink = page.getByRole('link', { name: /تسجيل الدخول|login|لديك حساب/i }).first()
    await loginLink.click()
    await expect(page).toHaveURL(/login\.html/)
  })
})
