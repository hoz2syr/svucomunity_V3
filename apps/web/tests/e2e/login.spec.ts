import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Login Page', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    await expect(page).toHaveTitle(/SVU|تسجيل الدخول|Login/i)
  })

  test('login form has email and password fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    await expect(page.getByLabel(/email|البريد|username|اسم المستخدم/i).first()).toBeVisible()
    await expect(page.getByLabel(/password|كلمة المرور/i).first()).toBeVisible()
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
  })

  test('login page has link to reset password', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    const resetLink = page.getByRole('link', { name: /إعادة تعيين|reset|forgot|نسيت كلمة المرور/i }).first()
    await expect(resetLink).toBeVisible()
  })

  test('shows error for empty credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    await page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first().click()
    await expect(page.getByRole('alert')).toContainText(/أدخل البريد وكلمة المرور/)
  })

  test('shows error for invalid email format', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    await page.getByLabel(/email|البريد|username|اسم المستخدم/i).first().fill('invalid-email')
    await page.getByLabel(/password|كلمة المرور/i).first().fill('password123')
    await page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first().click()
    await expect(page.getByRole('alert')).toContainText(/غير صحيحة/)
  })

  test('shows error for short password', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`)
    await page.getByLabel(/email|البريد|username|اسم المستخدم/i).first().fill('user@example.com')
    await page.getByLabel(/password|كلمة المرور/i).first().fill('short')
    await page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first().click()
    await expect(page.getByRole('alert')).toContainText(/قصيرة/)
  })
})
