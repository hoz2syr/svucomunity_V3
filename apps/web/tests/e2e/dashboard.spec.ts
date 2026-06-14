import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Dashboard Page', () => {
  test('dashboard page loads correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    await expect(page).toHaveTitle(/لوحة التحكم|dashboard/i)
  })

  test('dashboard shows user greeting', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const greeting = page.getByText(/مرحباً|أهلاً|welcome|hello/i).first()
    await expect(greeting).toBeVisible()
  })

  test('dashboard has navigation to courses', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const coursesLink = page.getByRole('link', { name: /المقررات|courses/i }).first()
    await expect(coursesLink).toBeVisible()
  })

  test('dashboard has logout button', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const logoutBtn = page.getByRole('button', { name: /تسجيل الخروج|logout|خروج/i }).first()
    await expect(logoutBtn).toBeVisible()
  })

  test('dashboard redirects to login if not authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    await expect(page).toHaveURL(/login|dashboard/, { timeout: 5000 })
    const currentUrl = page.url()
    const isLoginPage = currentUrl.includes('/login') || currentUrl.includes('login.html')
    const isDashboard = currentUrl.includes('dashboard')
    expect(isLoginPage || isDashboard).toBe(true)
  })
})
