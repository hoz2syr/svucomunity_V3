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
})
