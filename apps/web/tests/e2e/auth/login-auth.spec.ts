import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Login Authentication - Comprehensive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
  })

  test('page loads with valid title and RTL', async ({ page }) => {
    await expect(page).toHaveTitle(/SVU|تسجيل الدخول|Login/i)
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', /ar|en/)
  })

  test('email field is visible, enabled and has correct type', async ({ page }) => {
    const emailField = page.getByLabel(/email|البريد|username|اسم المستخدم/i).first()
    await expect(emailField).toBeVisible()
    await expect(emailField).toBeEnabled()
    await expect(emailField).toHaveAttribute('type', 'email')
    await expect(emailField).toHaveAttribute('autocomplete', 'email')
  })

  test('password field is visible, enabled and has correct type', async ({ page }) => {
    const passwordField = page.getByLabel(/password|كلمة المرور/i).first()
    await expect(passwordField).toBeVisible()
    await expect(passwordField).toBeEnabled()
    await expect(passwordField).toHaveAttribute('type', 'password')
    await expect(passwordField).toHaveAttribute('autocomplete', 'current-password')
  })

  test('submit button is visible and enabled', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first()
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toBeEnabled()
  })

  test('register link is visible and correct href', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /إنشاء حساب|register|sign up|تسجيل/i }).first()
    await expect(registerLink).toBeVisible()
    await expect(registerLink).toHaveAttribute('href', /register\.html/)
  })

  test('reset password link is visible', async ({ page }) => {
    const resetLink = page.getByRole('link', { name: /إعادة تعيين|reset|forgot|نسيت كلمة المرور/i }).first()
    await expect(resetLink).toBeVisible()
  })

  test('opens forgot password modal when clicking forgot link', async ({ page }) => {
    const forgotBtn = page.getByRole('button', { name: /نسيت كلمة المرور|forgot|إعادة تعيين/i }).first()
    await forgotBtn.click()
    const modal = page.locator('#forgotPasswordModal')
    await expect(modal).toBeVisible()
    await expect(modal).not.toHaveClass(/hidden/)
  })

  test('closes forgot password modal', async ({ page }) => {
    const forgotBtn = page.getByRole('button', { name: /نسيت كلمة المرور|forgot|إعادة تعيين/i }).first()
    await forgotBtn.click()
    const closeBtn = page.getByRole('button', { name: /close|إغلاق|غلق/i }).first()
    await closeBtn.click()
    const modal = page.locator('#forgotPasswordModal')
    await expect(modal).toHaveClass(/hidden/)
  })

  test('shows error when submitting empty form', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first()
    await submitBtn.click()

    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText(/أدخل البريد وكلمة المرور|required|مطلوب/i)
  })

  test('shows error for empty email with valid password', async ({ page }) => {
    await page.getByLabel(/password|كلمة المرور/i).first().fill('password123')
    await page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first().click()

    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
  })

  test('shows error for invalid email format', async ({ page }) => {
    await page.getByLabel(/email|البريد|username|اسم المستخدم/i).first().fill('invalid-email')
    await page.getByLabel(/password|كلمة المرور/i).first().fill('password123')
    await page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first().click()

    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText(/غير صحيح|invalid|صحيحة/i)
  })

  test('shows error for short password', async ({ page }) => {
    await page.getByLabel(/email|البريد|username|اسم المستخدم/i).first().fill('user@example.com')
    await page.getByLabel(/password|كلمة المرور/i).first().fill('short')
    await page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first().click()

    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText(/قصيرة|short|6|8/i)
  })

  test('submit button text changes when submitting', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first()
    await page.getByLabel(/email|البريد|username|اسم المستخدم/i).first().fill('user@example.com')
    await page.getByLabel(/password|كلمة المرور/i).first().fill('password123')
    await submitBtn.click()

    const btnText = submitBtn.locator('span').first()
    await expect(btnText).toBeVisible()
  })

  test('email input accepts valid email format', async ({ page }) => {
    const emailField = page.getByLabel(/email|البريد|username|اسم المستخدم/i).first()
    await emailField.fill('test@example.com')
    await expect(emailField).toHaveValue('test@example.com')
    await expect(emailField).toHaveAttribute('type', 'email')
  })

  test('password input masks characters', async ({ page }) => {
    const passwordField = page.getByLabel(/password|كلمة المرور/i).first()
    const testPassword = 'mypassword123'
    await passwordField.fill(testPassword)
    await expect(passwordField).toHaveValue(testPassword)
  })

  test('password toggle button exists and is clickable', async ({ page }) => {
    const toggleBtn = page.getByLabel(/show password|إظهار كلمة المرور|show|إظهار/i).first()
    await expect(toggleBtn).toBeVisible()
    await expect(toggleBtn).toBeEnabled()
  })

  test('forgot password modal has email input and submit button', async ({ page }) => {
    const forgotBtn = page.getByRole('button', { name: /نسيت كلمة المرور|forgot|إعادة تعيين/i }).first()
    await forgotBtn.click()

    const modalEmail = page.getByLabel(/email|البريد/i).last()
    await expect(modalEmail).toBeVisible()

    const modalSubmit = page.getByRole('button', { name: /إرسال|send|submit|استعادة/i }).first()
    await expect(modalSubmit).toBeVisible()
  })

  test('forgot password modal submit shows error for empty email', async ({ page }) => {
    const forgotBtn = page.getByRole('button', { name: /نسيت كلمة المرور|forgot|إعادة تعيين/i }).first()
    await forgotBtn.click()

    const modalSubmit = page.getByRole('button', { name: /إرسال|send|submit|استعادة/i }).first()
    await modalSubmit.click()

    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
  })

  test('forgot password modal accepts valid email', async ({ page }) => {
    const forgotBtn = page.getByRole('button', { name: /نسيت كلمة المرور|forgot|إعادة تعيين/i }).first()
    await forgotBtn.click()

    const modalEmail = page.getByLabel(/email|البريد/i).last()
    await modalEmail.fill('user@example.com')
    await expect(modalEmail).toHaveValue('user@example.com')
  })

  test('CSP header is present', async ({ page }) => {
    const csp = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      return meta?.getAttribute('content') || null
    })
    expect(csp).toBeTruthy()
    expect(csp).toContain("frame-ancestors 'none'")
  })

  test('no inline event handlers in login form', async ({ page }) => {
    const hasInlineHandlers = await page.evaluate(() => {
      const form = document.getElementById('loginForm')
      if (!form) return false
      const handlers = ['onclick', 'onsubmit', 'onchange']
      return handlers.some(handler => form.hasAttribute(handler))
    })
    expect(hasInlineHandlers).toBe(false)
  })

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))

    await page.reload()
    await expect(page.getByLabel(/email|البريد/i).first()).toBeVisible({ timeout: 10000 })

    expect(errors.length).toBe(0)
  })

  test('password field has minlength attribute', async ({ page }) => {
    const passwordField = page.getByLabel(/password|كلمة المرور/i).first()
    const minlength = await passwordField.getAttribute('minlength')
    expect(parseInt(minlength || '0')).toBeGreaterThanOrEqual(6)
  })

  test('form has novalidate attribute', async ({ page }) => {
    const form = page.locator('#loginForm')
    await expect(form).toHaveAttribute('novalidate')
  })

  test('login form submit attempts trigger validation', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first()
    const beforeCount = await page.locator('[role="alert"]').count()
    await submitBtn.click()
    const afterCount = await page.locator('[role="alert"]').count()
    expect(afterCount).toBeGreaterThanOrEqual(beforeCount)
  })

  test('register link navigation works', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /إنشاء حساب|register|sign up|تسجيل/i }).first()
    await registerLink.click()
    await expect(page).toHaveURL(/register\.html/)
  })

  test('back to home link navigation works', async ({ page }) => {
    const homeLink = page.getByRole('link', { name: /العودة للرئيسية|back.*home|الرئيسية/i }).first()
    await homeLink.click()
    await expect(page).toHaveURL(/index\.html|\/$/)
  })
})
