import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Courses Page', () => {
  test('courses page loads correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    await expect(page).toHaveTitle(/المقررات|courses|دورات/i)
  })

  test('courses page has filter/sort controls', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    const searchInput = page.getByPlaceholder(/بحث|search|البحث|بحث عن مقرر/i).first()
    await expect(searchInput).toBeVisible()
  })

  test('courses page shows course cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    const courseCards = page.locator('.course-card, [data-course], .course-item, [class*="course"]')
    await expect(courseCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('courses page shows loading state initially', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses.html`)
    const loadingText = page.getByText(/جارٍ التحميل|loading|جاري/i).first()
    await expect(loadingText).toBeVisible({ timeout: 5000 })
  })
})
