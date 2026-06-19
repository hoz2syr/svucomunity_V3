import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Dashboard Page - Comprehensive', () => {
  test('dashboard page loads with correct title and RTL', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    await expect(page).toHaveTitle(/لوحة التحكم|dashboard/i)
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  })

  test('dashboard shows loading state initially', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const loading = page.locator('#loadingState')
    await expect(loading).toBeVisible()
  })

  test('dashboard has sidebar navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const sidebar = page.locator('#sidebar, aside, [role="navigation"]').first()
    await expect(sidebar).toBeVisible()
  })

  test('dashboard has courses navigation link', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const coursesLink = page.getByRole('link', { name: /المقررات|courses/i }).first()
    await expect(coursesLink).toBeVisible()
  })

  test('dashboard has logout button', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const logoutBtn = page.getByRole('button', { name: /تسجيل الخروج|logout|خروج/i }).first()
    await expect(logoutBtn).toBeVisible()
  })

  test('dashboard has theme toggle button', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const themeBtn = page.getByLabel(/theme|سمة|toggle theme/i).first()
    await expect(themeBtn).toBeVisible()
  })

  test('dashboard has language toggle button', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const langBtn = page.getByLabel(/language|لغة|switch language/i).first()
    await expect(langBtn).toBeVisible()
  })

  test('dashboard shows user info card', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const userCard = page.locator('#userInfoCard')
    await expect(userCard).toBeVisible()
  })

  test('dashboard has stats grid with stat cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const statsGrid = page.locator('#statsGrid')
    await expect(statsGrid).toBeVisible()

    const statCards = page.locator('.stat-card')
    const count = await statCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('dashboard has welcome card', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const welcomeCard = page.getByText(/جاهز للتعلم|ready to learn/i).first()
    await expect(welcomeCard).toBeVisible()
  })

  test('dashboard has recent activity section', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const activity = page.locator('#recentActivity')
    await expect(activity).toBeVisible()
  })

  test('dashboard has quick links section', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const quickLinks = page.locator('#quickLinks')
    await expect(quickLinks).toBeVisible()
  })

  test('courses link in sidebar navigates correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const coursesLink = page.getByRole('link', { name: /المقررات|courses/i }).first()
    await coursesLink.click()
    await expect(page).toHaveURL(/courses\.html/)
  })

  test('dashboard has CSP header', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const csp = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      return meta?.getAttribute('content') || null
    })
    expect(csp).toBeTruthy()
    expect(csp).toContain("frame-ancestors 'none'")
  })

  test('logout button exists and is clickable', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const logoutBtn = page.getByRole('button', { name: /تسجيل الخروج|logout/i }).first()
    await expect(logoutBtn).toBeVisible()
    await expect(logoutBtn).toBeEnabled()
  })

  test('no inline event handlers in dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const hasInline = await page.evaluate(() => {
      const main = document.querySelector('main')
      if (!main) return false
      return ['onclick', 'onsubmit'].some(h => main.hasAttribute(h))
    })
    expect(hasInline).toBe(false)
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto(`${BASE_URL}/dashboard.html`)
    await expect(page.locator('#statsGrid')).toBeVisible({ timeout: 10000 })
    expect(errors.length).toBe(0)
  })

  test('sidebar toggle button is present on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    await page.setViewportSize({ width: 375, height: 667 })
    const sidebarToggle = page.locator('#sidebarToggle')
    await expect(sidebarToggle).toBeVisible()
  })

  test('back to home link works from dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`)
    const homeLink = page.getByRole('link', { name: /الرئيسية|home/i }).first()
    if ((await homeLink.count()) > 0) {
      await homeLink.click()
      await expect(page).toHaveURL(/index\.html|\/$/)
    }
  })
})
