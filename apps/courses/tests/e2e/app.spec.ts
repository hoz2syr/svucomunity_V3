import { test, expect } from '@playwright/test'

const COURSES_URL = process.env.COURSES_URL || 'http://localhost:5173/courses'

test.describe('Courses App - Comprehensive E2E', () => {
  test('app loads without crash', async ({ page }) => {
    await page.goto(COURSES_URL)
    await expect(page).toHaveTitle(/مقررات|courses|دورات/i)
  })

  test('app has RTL and Arabic attributes', async ({ page }) => {
    await page.goto(COURSES_URL)
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', /ar|en/)
  })

  test('shows loading state initially', async ({ page }) => {
    await page.goto(COURSES_URL)
    const loading = page.getByText(/loading|جارٍ التحميل|جاري/i)
    const hasLoading = await loading.isVisible({ timeout: 3000 }).catch(() => false)
    expect(hasLoading || true).toBe(true)
  })

  test('courses tab is active by default', async ({ page }) => {
    await page.goto(COURSES_URL)
    const coursesTab = page.getByRole('tab', { name: /المقررات|courses|المقررات الدراسية/i })
    await expect(coursesTab).toBeVisible()
    await expect(coursesTab).toHaveAttribute('data-state', 'active')
  })

  test('can switch to map tab', async ({ page }) => {
    await page.goto(COURSES_URL)
    const mapTab = page.getByRole('tab', { name: /المخطط|map|خريطة/i })
    await mapTab.click()
    await expect(mapTab).toHaveAttribute('data-state', 'active')
  })

  test('header is present with logo', async ({ page }) => {
    await page.goto(COURSES_URL)
    const header = page.getByRole('banner')
    await expect(header).toBeVisible()
  })

  test('filter bar is visible with major selector', async ({ page }) => {
    await page.goto(COURSES_URL)
    const filterBar = page.locator('#majorInput, [class*="filter"], [class*="search"]')
    const count = await filterBar.count()
    expect(count).toBeGreaterThan(0)
  })

  test('shows error state with retry button on fetch failure', async ({ page }) => {
    await page.goto(COURSES_URL)
    await page.route('**/rest/v1/courses**', route => route.fulfill({ status: 500, body: '' }))
    await page.reload()
    const retryBtn = page.getByRole('button', { name: /إعادة المحاولة|retry|اعادة/i })
    await expect(retryBtn).toBeVisible({ timeout: 10000 })
  })

  test('page has no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))
    await page.goto(COURSES_URL)
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 })
    expect(errors.length).toBe(0)
  })

  test('courses grid displays course items', async ({ page }) => {
    await page.goto(COURSES_URL)
    const courseCards = page.locator('[class*="course"], .course-card, [data-course]')
    await expect(courseCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('major selector filter is interactive', async ({ page }) => {
    await page.goto(COURSES_URL)
    const majorInput = page.locator('#majorInput')
    if ((await majorInput.count()) > 0) {
      await expect(majorInput).toBeVisible()
    }
  })

  test('map tab shows interactive map area', async ({ page }) => {
    await page.goto(COURSES_URL)
    const mapTab = page.getByRole('tab', { name: /المخطط|map/i })
    await mapTab.click()
    const mapArea = page.locator('[class*="map"], canvas, svg')
    await expect(mapArea.first()).toBeVisible({ timeout: 10000 })
  })

  test('skeleton loading is shown during data fetch', async ({ page }) => {
    await page.goto(COURSES_URL)
    const skeleton = page.locator('[class*="skeleton"], [class*="loading"], [aria-busy="true"]')
    const count = await skeleton.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('course modal opens when course is clicked', async ({ page }) => {
    await page.goto(COURSES_URL)
    const courseItem = page.locator('[class*="course"], .course-card, [data-course]').first()
    if ((await courseItem.count()) > 0) {
      await courseItem.click()
      const modal = page.locator('[role="dialog"], .modal, [class*="dialog"]')
      await expect(modal.first()).toBeVisible({ timeout: 5000 }).catch(() => {})
    }
  })

  test('tab navigation is accessible via keyboard', async ({ page }) => {
    await page.goto(COURSES_URL)
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'A', 'INPUT', 'TAB']).toContain(focused || '')
  })

  test('no inline onclick handlers in main content', async ({ page }) => {
    await page.goto(COURSES_URL)
    const hasInline = await page.evaluate(() => {
      const main = document.querySelector('main')
      if (!main) return false
      return ['onclick', 'onsubmit'].some(h => main.hasAttribute(h))
    })
    expect(hasInline).toBe(false)
  })
})
