import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/SVU/i)
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
})

test('login page is accessible', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: /login|sign in|تسجيل الدخول/i })).toBeVisible()
  await expect(page.getByLabel(/email|username|البريد|اسم المستخدم/i)).toBeVisible()
  await expect(page.getByLabel(/password|كلمة المرور/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /login|sign in|تسجيل/i })).toBeVisible()
})

test('navigation links work', async ({ page }) => {
  await page.goto('/')

  const navLink = page.getByRole('link', { name: /schedule|courses|courses| جدول|دورات/i }).first()
  await navLink.click()
  await page.waitForURL(/courses|schedule| Jard|دورات/)
})
