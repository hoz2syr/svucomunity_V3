import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Register Page', () => {
  test('register page loads correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    await expect(page).toHaveTitle(/تسجيل|register|إنشاء/i)
  })

  test('register form has all required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    await expect(page.getByLabel(/email|البريد|username|اسم المستخدم/i).first()).toBeVisible()
    await expect(page.getByLabel(/password|كلمة المرور/i).first()).toBeVisible()
  })

  test('register form has name field', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.html`)
    await expect(page.getByLabel(/name|الاسم|الاسم الكامل/i).first()).toBeVisible()
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
  })
})
