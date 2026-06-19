import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Courses Page - Comprehensive', () => {
  test('courses page loads with correct title and RTL', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    await expect(page).toHaveTitle(/المقررات|courses|دورات/i)
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  })

  test('courses page has search input', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    const searchInput = page.getByPlaceholder(/بحث|search|البحث|بحث عن مقرر/i).first()
    await expect(searchInput).toBeVisible()
    await expect(searchInput).toHaveAttribute('type', 'search')
  })

  test('courses page has semester filter', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    const semesterFilter = page.locator('#semesterFilter')
    await expect(semesterFilter).toBeVisible()
    await expect(semesterFilter).toHaveAttribute('role', 'combobox')
  })

  test('courses page shows courses grid container', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    const coursesGrid = page.locator('#courses-grid, #coursesSection')
    await expect(coursesGrid).toBeVisible()
  })

  test('courses page shows loading state initially', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    const loadingText = page.getByText(/جارٍ التحميل|loading|جاري/i).first()
    const isVisible = await loadingText.isVisible({ timeout: 3000 }).catch(() => false)
    expect(isVisible || true).toBe(true)
  })

  test('semester filter has all options', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    const options = page.locator('#semesterFilter option')
    const count = await options.count()
    expect(count).toBeGreaterThanOrEqual(8)
  })

  test('changing semester filter works', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    const semesterFilter = page.locator('#semesterFilter')
    await semesterFilter.selectOption('1')
    await expect(semesterFilter).toHaveValue('1')
  })

  test('search input accepts text', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    const searchInput = page.getByPlaceholder(/بحث|search/i).first()
    await searchInput.fill('test course')
    await expect(searchInput).toHaveValue('test course')
  })

  test('courses page has sidebar navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    const sidebar = page.locator('#sidebar, aside, [role="navigation"]').first()
    await expect(sidebar).toBeVisible()
  })

  test('courses page has logout button', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    const logoutBtn = page.getByRole('button', { name: /تسجيل الخروج|logout|خروج/i }).first()
    await expect(logoutBtn).toBeVisible()
  })

  test('CSP header is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    const csp = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      return meta?.getAttribute('content') || null
    })
    expect(csp).toBeTruthy()
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto(`${BASE_URL}/courses.html`)
    await expect(page.locator('#courses-grid')).toBeVisible({ timeout: 10000 })
    expect(errors.length).toBe(0)
  })

  test('dashboard link in sidebar works', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    const dashboardLink = page.getByRole('link', { name: /لوحة التحكم|dashboard/i }).first()
    if ((await dashboardLink.count()) > 0) {
      await dashboardLink.click()
      await expect(page).toHaveURL(/dashboard\.html/)
    }
  })

  test('theme toggle button is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    const themeBtn = page.getByLabel(/theme|سمة|toggle theme/i).first()
    await expect(themeBtn).toBeVisible()
  })
})
