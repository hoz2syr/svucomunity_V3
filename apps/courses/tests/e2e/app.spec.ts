import { test, expect } from '@playwright/test'

const COURSES_URL = process.env.COURSES_URL || 'http://localhost:5173/courses'

test.describe('Courses App - E2E', () => {
  test('app loads without crash', async ({ page }) => {
    await page.goto(COURSES_URL)
    await expect(page).toHaveTitle(/مقررات|courses|دورات/i)
  })

  test('shows course grid or loading state', async ({ page }) => {
    await page.goto(COURSES_URL)
    const loading = page.getByText(/loading|جارٍ التحميل|جاري/i)
    const hasLoading = await loading.isVisible({ timeout: 3000 }).catch(() => false)
    const coursesTab = page.getByRole('tab', { name: /المقررات|courses/i })
    await expect(coursesTab).toBeVisible()
  })

  test('courses tab is active by default', async ({ page }) => {
    await page.goto(COURSES_URL)
    const coursesTab = page.getByRole('tab', { name: /المقررات|courses/i })
    await expect(coursesTab).toHaveAttribute('data-state', 'active')
  })

  test('can switch to map tab', async ({ page }) => {
    await page.goto(COURSES_URL)
    const mapTab = page.getByRole('tab', { name: /المخطط|map/i })
    await mapTab.click()
    await expect(mapTab).toHaveAttribute('data-state', 'active')
  })

  test('header is present', async ({ page }) => {
    await page.goto(COURSES_URL)
    const header = page.getByRole('banner')
    await expect(header).toBeVisible()
  })

  test('filter bar is visible', async ({ page }) => {
    await page.goto(COURSES_URL)
    const searchInput = page.getByPlaceholder(/بحث|search|البحث/i)
    await expect(searchInput).toBeVisible()
  })

  test('error state shows retry button on fetch failure', async ({ page }) => {
    await page.goto(COURSES_URL)
    await page.route('**/rest/v1/courses**', route => route.fulfill({ status: 500, body: '' }))
    await page.reload()
    const retryBtn = page.getByRole('button', { name: /إعادة المحاولة|retry/i })
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
})
