import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Login Page - Comprehensive', () => {
  test('login page loads with correct title and RTL', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    await expect(page).toHaveTitle(/SVU|تسجيل الدخول|Login/i)
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', /ar|en/)
  })

  test('login form has email and password fields with correct types', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    const emailField = page.getByLabel(/email|البريد|username|اسم المستخدم/i).first()
    await expect(emailField).toBeVisible()
    await expect(emailField).toHaveAttribute('type', 'email')
    await expect(emailField).toHaveAttribute('autocomplete', 'email')

    const passwordField = page.getByLabel(/password|كلمة المرور/i).first()
    await expect(passwordField).toBeVisible()
    await expect(passwordField).toHaveAttribute('type', 'password')
  })

  test('login form has submit button', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    const submitBtn = page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first()
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toBeEnabled()
  })

  test('login page has link to register', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    const registerLink = page.getByRole('link', { name: /إنشاء حساب|register|sign up|تسجيل/i }).first()
    await expect(registerLink).toBeVisible()
    await expect(registerLink).toHaveAttribute('href', /register\.html/)
  })

  test('login page has link to reset password', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    const resetLink = page.getByRole('link', { name: /إعادة تعيين|reset|forgot|نسيت كلمة المرور/i }).first()
    await expect(resetLink).toBeVisible()
  })

  test('shows error for empty credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    await page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first().click()
    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText(/أدخل البريد وكلمة المرور/)
  })

  test('shows error for invalid email format', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    await page.getByLabel(/email|البريد|username|اسم المستخدم/i).first().fill('invalid-email')
    await page.getByLabel(/password|كلمة المرور/i).first().fill('password123')
    await page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first().click()
    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText(/غير صحيحة/)
  })

  test('shows error for short password', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    await page.getByLabel(/email|البريد|username|اسم المستخدم/i).first().fill('user@example.com')
    await page.getByLabel(/password|كلمة المرور/i).first().fill('short')
    await page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first().click()
    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText(/قصيرة/)
  })

  test('forgot password modal can be opened and closed', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    const forgotBtn = page.getByRole('button', { name: /نسيت كلمة المرور|forgot/i }).first()
    await forgotBtn.click()
    const modal = page.locator('#forgotPasswordModal')
    await expect(modal).toBeVisible()

    const closeBtn = page.getByRole('button', { name: /close|إغلاق/i }).first()
    await closeBtn.click()
    await expect(modal).toHaveClass(/hidden/)
  })

  test('CSP header is present on login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    const csp = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      return meta?.getAttribute('content') || null
    })
    expect(csp).toBeTruthy()
    expect(csp).toContain("frame-ancestors 'none'")
  })

  test('no inline event handlers in login form', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    const hasInline = await page.evaluate(() => {
      const form = document.getElementById('loginForm')
      if (!form) return false
      return ['onclick', 'onsubmit'].some(h => form.hasAttribute(h))
    })
    expect(hasInline).toBe(false)
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto(`${BASE_URL}/login.html`)
    await expect(page.getByLabel(/email|البريد/i).first()).toBeVisible({ timeout: 10000 })
    expect(errors.length).toBe(0)
  })

  test('password has minlength of 8', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    const pw = page.getByLabel(/password|كلمة المرور/i).first()
    const minlength = await pw.getAttribute('minlength')
    expect(parseInt(minlength || '0')).toBe(8)
  })

  test('register link navigates correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    const registerLink = page.getByRole('link', { name: /إنشاء حساب|register|sign up/i }).first()
    await registerLink.click()
    await expect(page).toHaveURL(/register\.html/)
  })

  test('password visibility toggle button is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    const toggleBtn = page.getByLabel(/show password|إظهار|إخفاء/i).first()
    await expect(toggleBtn).toBeVisible()
  })
})
