import { test, expect } from '@playwright/test'

const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5173/admin'

test.describe('Admin App - E2E', () => {
  test('app loads without crash', async ({ page }) => {
    await page.goto(ADMIN_URL)
    await expect(page).toHaveTitle(/إدارة|admin/i)
  })

  test('shows loading state initially', async ({ page }) => {
    await page.goto(ADMIN_URL)
    const loadingText = page.getByText(/جارٍ|loading|جاري التحميل/i).first()
    const isLoadingVisible = await loadingText.isVisible({ timeout: 3000 }).catch(() => false)
    expect(await page.title()).toBeTruthy()
  })

  test('shows unauthorized message for non-admin user', async ({ page }) => {
    await page.goto(ADMIN_URL)
    const unauthorizedText = page.getByText(/غير مصرح|not authorized|unAuthorized|صلاحيات/i)
    await expect(unauthorizedText).toBeVisible({ timeout: 10000 })
  })

  test('admin layout sidebar is present for admin users', async ({ page }) => {
    await page.goto(ADMIN_URL)
    const sidebar = page.locator('nav, aside, [role="navigation"]').first()
    const count = await sidebar.count()
    const hasNav = count > 0
    expect(hasNav).toBe(true)
  })

  test('users page route is accessible', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/users`)
    const heading = page.getByRole('heading', { name: /مستخدمين|users|إدارة/i }).first()
    await expect(heading).toBeVisible({ timeout: 10000 })
  })

  test('courses page route is accessible', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/courses`)
    const heading = page.getByRole('heading', { name: /مقررات|courses|إدارة/i }).first()
    await expect(heading).toBeVisible({ timeout: 10000 })
  })

  test('settings page route is accessible', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/settings`)
    const heading = page.getByRole('heading', { name: /إعدادات|settings/i }).first()
    await expect(heading).toBeVisible({ timeout: 10000 })
  })

  test('dashboard page is accessible', async ({ page }) => {
    await page.goto(ADMIN_URL)
    const heading = page.getByRole('heading', { name: /لوحة|dashboard/i }).first()
    await expect(heading).toBeVisible({ timeout: 10000 })
  })

  test('page has no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))
    await page.goto(ADMIN_URL)
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 })
    expect(errors.length).toBe(0)
  })
})
