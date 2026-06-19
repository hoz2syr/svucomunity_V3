import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Register Authentication - Comprehensive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
  })

  test('register page loads with valid title and RTL', async ({ page }) => {
    await expect(page).toHaveTitle(/تسجيل|register|إنشاء/i)
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', /ar|en/)
  })

  test('register form is visible', async ({ page }) => {
    const form = page.locator('#registerForm')
    await expect(form).toBeVisible()
  })

  test('username field is visible, enabled and has correct pattern', async ({ page }) => {
    const usernameField = page.getByLabel(/username|اسم المستخدم|الاسم|البريد/i).first()
    await expect(usernameField).toBeVisible()
    await expect(usernameField).toBeEnabled()
    await expect(usernameField).toHaveAttribute('type', 'text')
    const pattern = await usernameField.getAttribute('pattern')
    expect(pattern).toBeTruthy()
  })

  test('email field is visible, enabled and has correct type', async ({ page }) => {
    const emailField = page.getByLabel(/email|البريد|username|اسم المستخدم/i).first()
    await expect(emailField).toBeVisible()
    await expect(emailField).toBeEnabled()
    await expect(emailField).toHaveAttribute('type', 'email')
    await expect(emailField).toHaveAttribute('autocomplete', 'email')
  })

  test('password field is visible and has correct attributes', async ({ page }) => {
    const passwordField = page.getByLabel(/password|كلمة المرور/i).first()
    await expect(passwordField).toBeVisible()
    await expect(passwordField).toBeEnabled()
    await expect(passwordField).toHaveAttribute('type', 'password')
    await expect(passwordField).toHaveAttribute('autocomplete', 'new-password')

    const minlength = await passwordField.getAttribute('minlength')
    expect(parseInt(minlength || '0')).toBeGreaterThanOrEqual(8)
  })

  test('confirm password field is visible', async ({ page }) => {
    const confirmField = page.getByLabel(/confirm|تأكيد|تأكيد كلمة/i).first()
    await expect(confirmField).toBeVisible()
    await expect(confirmField).toBeEnabled()
  })

  test('submit button is visible and enabled', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /إنشاء حساب|register|تسجيل/i }).first()
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toBeEnabled()
  })

  test('login link is visible and correct href', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /تسجيل الدخول|login|لديك حساب/i }).first()
    await expect(loginLink).toBeVisible()
    await expect(loginLink).toHaveAttribute('href', /login\.html/)
  })

  test('terms checkbox is visible and required', async ({ page }) => {
    const termsCheckbox = page.getByLabel(/شروط|terms|أوافق/i).first()
    await expect(termsCheckbox).toBeVisible()
    await expect(termsCheckbox).toHaveAttribute('required')
  })

  test('shows validation error for mismatched passwords', async ({ page }) => {
    await page.getByLabel(/password|كلمة المرور/i).first().fill('password123')
    const confirmPasswordField = page.getByLabel(/confirm|تأكيد|إعادة/i).first()
    await confirmPasswordField.fill('different456')

    const submitBtn = page.getByRole('button', { name: /إنشاء حساب|register|تسجيل/i }).first()
    await submitBtn.click()

    const matchMsg = page.locator('#matchMsg')
    await expect(matchMsg).toBeVisible()
    await expect(matchMsg).toContainText(/غير متطابقة|mismatch|تأكيد/i)
  })

  test('shows matching passwords message hides on match', async ({ page }) => {
    await page.getByLabel(/password|كلمة المرور/i).first().fill('password123')
    const confirmPasswordField = page.getByLabel(/confirm|تأكيد|إعادة/i).first()
    await confirmPasswordField.fill('password123')

    const matchMsg = page.locator('#matchMsg')
    await expect(matchMsg).toHaveClass(/hidden/)
  })

  test('email input accepts valid format', async ({ page }) => {
    const emailField = page.getByLabel(/email|البريد|username|اسم المستخدم/i).first()
    await emailField.fill('newuser@example.com')
    await expect(emailField).toHaveValue('newuser@example.com')
  })

  test('name field accepts Arabic text', async ({ page }) => {
    const nameField = page.getByLabel(/name|الاسم|الاسم الأول/i).first()
    if ((await nameField.count()) > 0) {
      await nameField.fill('محمد أحمد')
      await expect(nameField).toHaveValue('محمد أحمد')
    }
  })

  test('username field accepts valid format', async ({ page }) => {
    const usernameField = page.getByLabel(/username|اسم المستخدم/i).first()
    if ((await usernameField.count()) > 0) {
      await usernameField.fill('ahmed_123456')
      await expect(usernameField).toHaveValue('ahmed_123456')
    }
  })

  test('password toggle buttons are present', async ({ page }) => {
    const togglePwd = page.getByLabel(/إظهار|إخفاء|show|hide|toggle.*password/i).first()
    await expect(togglePwd).toBeVisible()
  })

  test('CSP header is present', async ({ page }) => {
    const csp = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      return meta?.getAttribute('content') || null
    })
    expect(csp).toBeTruthy()
  })

  test('no inline event handlers in register form', async ({ page }) => {
    const hasInlineHandlers = await page.evaluate(() => {
      const form = document.getElementById('registerForm')
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
    await expect(page.locator('#registerForm')).toBeVisible({ timeout: 10000 })

    expect(errors.length).toBe(0)
  })

  test('major search input exists', async ({ page }) => {
    const majorInput = page.locator('#majorInput')
    await expect(majorInput).toBeVisible()
  })

  test('country button exists and expandable', async ({ page }) => {
    const countryBtn = page.locator('#countryBtn')
    await expect(countryBtn).toBeVisible()
    await expect(countryBtn).toHaveAttribute('aria-haspopup', 'listbox')
  })

  test('phone field accepts digits', async ({ page }) => {
    const phoneField = page.locator('#phone')
    if ((await phoneField.count()) > 0) {
      await expect(phoneField).toBeVisible()
      await expect(phoneField).toHaveAttribute('type', 'tel')
    }
  })

  test('form submission with empty fields shows required errors', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /إنشاء حساب|register|تسجيل/i }).first()
    await submitBtn.click()

    const alerts = page.locator('[role="alert"]')
    const count = await alerts.count()
    expect(count).toBeGreaterThan(0)
  })

  test('homepage link from register works', async ({ page }) => {
    const homeLink = page.getByRole('link', { name: /العودة للرئيسية|back.*home|الرئيسية/i }).first()
    await homeLink.click()
    await expect(page).toHaveURL(/index\.html|\/$/)
  })
})
