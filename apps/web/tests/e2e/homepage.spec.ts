import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Homepage - Comprehensive', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page).toHaveTitle(/SVU/i)
  })

  test('homepage has RTL and Arabic language', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', /ar|en/)
  })

  test('homepage has primary heading', async ({ page }) => {
    await page.goto(BASE_URL)
    const heading = page.getByRole('heading', { level: 1 }).first()
    await expect(heading).toBeVisible()
    await expect(heading).toContainText(/SVU/)
  })

  test('homepage has tagline text', async ({ page }) => {
    await page.goto(BASE_URL)
    const tagline = page.getByText(/تقنية المعلومات|Information Technology/i).first()
    await expect(tagline).toBeVisible()
  })

  test('homepage has login CTA button', async ({ page }) => {
    await page.goto(BASE_URL)
    const loginBtn = page.getByRole('link', { name: /تسجيل الدخول|login|دخول/i }).first()
    await expect(loginBtn).toBeVisible()
    await expect(loginBtn).toHaveAttribute('href', /login\.html/)
  })

  test('homepage has register CTA button', async ({ page }) => {
    await page.goto(BASE_URL)
    const registerBtn = page.getByRole('link', { name: /إنشاء حساب|register|sign up/i }).first()
    await expect(registerBtn).toBeVisible()
    await expect(registerBtn).toHaveAttribute('href', /register\.html/)
  })

  test('homepage has logo image', async ({ page }) => {
    await page.goto(BASE_URL)
    const logo = page.getByAlt('SVU Community').first()
    await expect(logo).toBeVisible()
    await expect(logo).toHaveAttribute('src', /icon\.svg|icon\.png/)
  })

  test('homepage has navigation links', async ({ page }) => {
    await page.goto(BASE_URL)
    const links = page.getByRole('link')
    const count = await links.count()
    expect(count).toBeGreaterThan(0)
  })

  test('theme toggle button is present', async ({ page }) => {
    await page.goto(BASE_URL)
    const themeBtn = page.getByLabel(/theme|سمة|الوضع|toggle theme/i).first()
    await expect(themeBtn).toBeVisible()
  })

  test('language toggle button is present', async ({ page }) => {
    await page.goto(BASE_URL)
    const langBtn = page.getByLabel(/language|لغة|toggle language/i).first()
    await expect(langBtn).toBeVisible()
  })

  test('links navigate to correct pages', async ({ page }) => {
    await page.goto(BASE_URL)

    const loginLink = page.getByRole('link', { name: /تسجيل الدخول|login|دخول/i }).first()
    await loginLink.click()
    await expect(page).toHaveURL(/login\.html/)
  })

  test('register link navigates to register page', async ({ page }) => {
    await page.goto(BASE_URL)

    const registerLink = page.getByRole('link', { name: /إنشاء حساب|register|sign up/i }).first()
    await registerLink.click()
    await expect(page).toHaveURL(/register\.html/)
  })

  test('CSP header is present', async ({ page }) => {
    await page.goto(BASE_URL)
    const csp = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      return meta?.getAttribute('content') || null
    })
    expect(csp).toBeTruthy()
    expect(csp).toContain("frame-ancestors 'none'")
  })

  test('no inline event handlers in main content', async ({ page }) => {
    await page.goto(BASE_URL)
    const hasInlineHandlers = await page.evaluate(() => {
      const main = document.getElementById('main-content')
      if (!main) return false
      const handlers = ['onclick', 'onsubmit']
      return handlers.some(handler => main.hasAttribute(handler))
    })
    expect(hasInlineHandlers).toBe(false)
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto(BASE_URL)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 10000 })

    expect(errors.length).toBe(0)
  })

  test('meta description is present', async ({ page }) => {
    await page.goto(BASE_URL)
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
    expect(description!.length).toBeGreaterThan(0)
  })

  test('favicon is linked', async ({ page }) => {
    await page.goto(BASE_URL)
    const favicon = page.locator('link[rel="icon"]')
    await expect(favicon.first()).toBeAttached()
  })
})
