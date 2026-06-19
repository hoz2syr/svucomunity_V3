import { test, expect } from '@playwright/test'

const SCHEDULE_URL = process.env.SCHEDULE_URL || 'http://localhost:3001'

test.describe('Schedule App - Comprehensive E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SCHEDULE_URL)
  })

  test('app loads without crash and has title', async ({ page }) => {
    await expect(page).toHaveTitle(/SVU|جدول|schedule|UniSync/i)
  })

  test('app has RTL and Arabic attributes', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', /ar|en/)
  })

  test('shows landing page when not authenticated', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /جدول|schedule|دراسي|UniSync/i }).first()
    await expect(heading).toBeVisible({ timeout: 5000 })
  })

  test('has Google login button', async ({ page }) => {
    const loginBtn = page.getByRole('button', { name: /google|جوجل|تسجيل الدخول|login/i }).first()
    await expect(loginBtn).toBeVisible()
  })

  test('shows auth loader while checking session', async ({ page }) => {
    await page.goto(SCHEDULE_URL)
    const loadingText = page.getByText(/loading|Loading|جارٍ|تحميل|جاري التحميل/i).first()
    await expect(loadingText).toBeVisible({ timeout: 5000 })
  })

  test('app footer is present with branding', async ({ page }) => {
    const footer = page.getByText(/UniSync|SVU|2026/i).last()
    await expect(footer).toBeVisible()
  })

  test('app header is present', async ({ page }) => {
    const header = page.getByRole('banner')
    await expect(header).toBeVisible()
  })

  test('page has no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto(SCHEDULE_URL)
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 })
    expect(errors.length).toBe(0)
  })

  test('landing page has description text', async ({ page }) => {
    const desc = page.getByText(/جدول|دراسي|schedule|محاضرات|مقررات/i).first()
    await expect(desc).toBeVisible()
  })

  test('login button is enabled and clickable', async ({ page }) => {
    const loginBtn = page.getByRole('button', { name: /google|جوجل|تسجيل الدخول/i }).first()
    await expect(loginBtn).toBeEnabled()
  })

  test('brand logo is visible', async ({ page }) => {
    const logo = page.getByAlt('UniSync').or(page.getByAlt('SVU')).first()
    await expect(logo).toBeVisible()
  })

  test('no CSP violations on load', async ({ page }) => {
    const cspViolations: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') cspViolations.push(msg.text())
    })

    await page.reload()
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 })

    const hasCSPIssue = cspViolations.some(v =>
      v.includes('Content Security Policy') || v.includes('CSP')
    )
    expect(hasCSPIssue).toBe(false)
  })

  test('footer has copyright text', async ({ page }) => {
    const copyright = page.getByText(/©|copyright|2026|UniSync/i).last()
    await expect(copyright).toBeVisible()
  })
})
