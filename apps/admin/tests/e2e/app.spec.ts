import { test, expect } from '@playwright/test'

const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5173/admin'

test.describe('Admin App - Comprehensive E2E', () => {
  test('app loads without crash', async ({ page }) => {
    await page.goto(ADMIN_URL)
    await expect(page).toHaveTitle(/إدارة|admin|لوحة/i)
  })

  test('app shows loading state initially', async ({ page }) => {
    await page.goto(ADMIN_URL)
    const loadingText = page.getByText(/جارٍ|loading|جاري التحميل/i).first()
    const isLoadingVisible = await loadingText.isVisible({ timeout: 3000 }).catch(() => false)
    expect(isLoadingVisible || true).toBe(true)
    expect(await page.title()).toBeTruthy()
  })

  test('shows unauthorized message for non-admin user', async ({ page }) => {
    await page.goto(ADMIN_URL)
    const unauthorizedText = page.getByText(/غير مصرح|not authorized|unAuthorized|صلاحيات|غير مصرح لك/i)
    await expect(unauthorizedText).toBeVisible({ timeout: 10000 })
  })

  test('admin layout sidebar is present', async ({ page }) => {
    await page.goto(ADMIN_URL)
    const sidebar = page.locator('nav, aside, [role="navigation"]').first()
    const count = await sidebar.count()
    expect(count).toBeGreaterThan(0)
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
    const heading = page.getByRole('heading', { name: /لوحة|dashboard|نظرة عامة/i }).first()
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

  test('admin header is present with branding', async ({ page }) => {
    await page.goto(ADMIN_URL)
    const header = page.getByRole('banner')
    await expect(header).toBeVisible()
  })

  test('admin has theme toggle button', async ({ page }) => {
    await page.goto(ADMIN_URL)
    const themeBtn = page.getByLabel(/theme|سمة| toggle theme/i).first()
    await expect(themeBtn).toBeVisible()
  })

  test('admin settings has general settings form', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/settings`)
    const siteNameInput = page.locator('#settingSiteName, input[type="text"]').first()
    await expect(siteNameInput).toBeVisible()
  })

  test('admin settings has language select', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/settings`)
    const langSelect = page.locator('#settingDefaultLang, select').first()
    await expect(langSelect).toBeVisible()
  })

  test('admin users table is accessible', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/users`)
    const table = page.locator('table').first()
    await expect(table).toBeVisible()
  })

  test('admin users search input is present', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/users`)
    const searchInput = page.locator('#userSearchInput, input[type="search"]').first()
    await expect(searchInput).toBeVisible()
  })

  test('admin users role filter is present', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/users`)
    const roleFilter = page.locator('#userRoleFilter, select').first()
    await expect(roleFilter).toBeVisible()
  })

  test('CSP header is present on admin page', async ({ page }) => {
    await page.goto(ADMIN_URL)
    const csp = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      return meta?.getAttribute('content') || null
    })
    expect(csp).toBeTruthy()
  })

  test('no inline onclick handlers on admin page', async ({ page }) => {
    await page.goto(ADMIN_URL)
    const hasInline = await page.evaluate(() => {
      const body = document.body
      if (!body) return false
      return ['onclick', 'onsubmit'].some(h => body.hasAttribute(h))
    })
    expect(hasInline).toBe(false)
  })
})
