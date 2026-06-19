import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Web App - E2E', () => {
  test('homepage loads with title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/SVU/i)
  })

  test('homepage has RTL and lang attributes', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', /ar|en/)
  })

  test('homepage has primary heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
  })

  test('homepage has CTA buttons', async ({ page }) => {
    await page.goto('/')
    const loginLink = page.getByRole('link', { name: /تسجيل الدخول|login/i }).first()
    await expect(loginLink).toBeVisible()

    const registerLink = page.getByRole('link', { name: /إنشاء حساب|register/i }).first()
    await expect(registerLink).toBeVisible()
  })

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login.html')
    await expect(page.getByRole('heading', { name: /login|تسجيل الدخول/i })).toBeVisible()
    await expect(page.getByLabel(/email|البريد/i)).toBeVisible()
    await expect(page.getByLabel(/password|كلمة المرور/i)).toBeVisible()
  })

  test('register page is accessible', async ({ page }) => {
    await page.goto('/register.html')
    await expect(page.getByRole('heading', { name: /register|إنشاء/i })).toBeVisible()
    await expect(page.getByLabel(/email|البريد/i)).toBeVisible()
  })

  test('courses page is accessible', async ({ page }) => {
    await page.goto('/courses.html')
    await expect(page.getByRole('heading', { name: /المقررات|courses/i })).toBeVisible()
  })

  test('dashboard page is accessible', async ({ page }) => {
    await page.goto('/dashboard.html')
    await expect(page.getByRole('heading', { name: /لوحة التحكم|dashboard/i })).toBeVisible()
  })

  test('no console errors on homepage', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 10000 })
    expect(errors.length).toBe(0)
  })

  test('CSP is present on all main pages', async ({ page }) => {
    const pages = ['/', '/login.html', '/register.html', '/courses.html', '/dashboard.html']
    for (const p of pages) {
      await page.goto(`${BASE_URL}${p}`)
      const csp = await page.evaluate(() => {
        const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
        return meta?.getAttribute('content') || null
      })
      expect(csp).toBeTruthy()
    }
  })

  test('login page CSP has frame-ancestors none', async ({ page }) => {
    await page.goto('/login.html')
    const csp = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      return meta?.getAttribute('content') || null
    })
    expect(csp).toContain("frame-ancestors 'none'")
  })

  test('all navigation links have valid href', async ({ page }) => {
    await page.goto('/')
    const links = await page.getByRole('link').all()
    for (const link of links) {
      const href = await link.getAttribute('href')
      if (href && !href.startsWith('#') && !href.startsWith('http')) {
        const response = await page.goto(`${BASE_URL}${href}`).catch(() => null)
        expect(response?.status()).toBeLessThan(400)
        await page.goto('/')
      }
    }
  })
})
