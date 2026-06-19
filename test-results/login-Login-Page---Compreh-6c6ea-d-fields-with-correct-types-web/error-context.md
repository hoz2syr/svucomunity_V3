# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Login Page - Comprehensive >> login form has email and password fields with correct types
- Location: apps\web\tests\e2e\login.spec.ts:13:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByLabel(/email|البريد|username|اسم المستخدم/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByLabel(/email|البريد|username|اسم المستخدم/i).first()

```

```yaml
- main:
  - paragraph: "404"
  - heading "الصفحة غير موجودة" [level=1]
  - paragraph: لا يمكننا العثور على الصفحة التي تبحث عنها. يمكنك العودة إلى الصفحة الرئيسية ومتابعة التصفح من هناك.
  - link "العودة للرئيسية":
    - /url: /
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
  4   | 
  5   | test.describe('Login Page - Comprehensive', () => {
  6   |   test('login page loads with correct title and RTL', async ({ page }) => {
  7   |     await page.goto(`${BASE_URL}/login.html`)
  8   |     await expect(page).toHaveTitle(/SVU|تسجيل الدخول|Login/i)
  9   |     await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  10  |     await expect(page.locator('html')).toHaveAttribute('lang', /ar|en/)
  11  |   })
  12  | 
  13  |   test('login form has email and password fields with correct types', async ({ page }) => {
  14  |     await page.goto(`${BASE_URL}/login.html`)
  15  |     const emailField = page.getByLabel(/email|البريد|username|اسم المستخدم/i).first()
> 16  |     await expect(emailField).toBeVisible()
      |                              ^ Error: expect(locator).toBeVisible() failed
  17  |     await expect(emailField).toHaveAttribute('type', 'email')
  18  |     await expect(emailField).toHaveAttribute('autocomplete', 'email')
  19  | 
  20  |     const passwordField = page.getByLabel(/password|كلمة المرور/i).first()
  21  |     await expect(passwordField).toBeVisible()
  22  |     await expect(passwordField).toHaveAttribute('type', 'password')
  23  |   })
  24  | 
  25  |   test('login form has submit button', async ({ page }) => {
  26  |     await page.goto(`${BASE_URL}/login.html`)
  27  |     const submitBtn = page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first()
  28  |     await expect(submitBtn).toBeVisible()
  29  |     await expect(submitBtn).toBeEnabled()
  30  |   })
  31  | 
  32  |   test('login page has link to register', async ({ page }) => {
  33  |     await page.goto(`${BASE_URL}/login.html`)
  34  |     const registerLink = page.getByRole('link', { name: /إنشاء حساب|register|sign up|تسجيل/i }).first()
  35  |     await expect(registerLink).toBeVisible()
  36  |     await expect(registerLink).toHaveAttribute('href', /register\.html/)
  37  |   })
  38  | 
  39  |   test('login page has link to reset password', async ({ page }) => {
  40  |     await page.goto(`${BASE_URL}/login.html`)
  41  |     const resetLink = page.getByRole('link', { name: /إعادة تعيين|reset|forgot|نسيت كلمة المرور/i }).first()
  42  |     await expect(resetLink).toBeVisible()
  43  |   })
  44  | 
  45  |   test('shows error for empty credentials', async ({ page }) => {
  46  |     await page.goto(`${BASE_URL}/login.html`)
  47  |     await page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first().click()
  48  |     const alert = page.getByRole('alert')
  49  |     await expect(alert).toBeVisible()
  50  |     await expect(alert).toContainText(/أدخل البريد وكلمة المرور/)
  51  |   })
  52  | 
  53  |   test('shows error for invalid email format', async ({ page }) => {
  54  |     await page.goto(`${BASE_URL}/login.html`)
  55  |     await page.getByLabel(/email|البريد|username|اسم المستخدم/i).first().fill('invalid-email')
  56  |     await page.getByLabel(/password|كلمة المرور/i).first().fill('password123')
  57  |     await page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first().click()
  58  |     const alert = page.getByRole('alert')
  59  |     await expect(alert).toBeVisible()
  60  |     await expect(alert).toContainText(/غير صحيحة/)
  61  |   })
  62  | 
  63  |   test('shows error for short password', async ({ page }) => {
  64  |     await page.goto(`${BASE_URL}/login.html`)
  65  |     await page.getByLabel(/email|البريد|username|اسم المستخدم/i).first().fill('user@example.com')
  66  |     await page.getByLabel(/password|كلمة المرور/i).first().fill('short')
  67  |     await page.getByRole('button', { name: /login|تسجيل الدخول|دخول/i }).first().click()
  68  |     const alert = page.getByRole('alert')
  69  |     await expect(alert).toBeVisible()
  70  |     await expect(alert).toContainText(/قصيرة/)
  71  |   })
  72  | 
  73  |   test('forgot password modal can be opened and closed', async ({ page }) => {
  74  |     await page.goto(`${BASE_URL}/login.html`)
  75  |     const forgotBtn = page.getByRole('button', { name: /نسيت كلمة المرور|forgot/i }).first()
  76  |     await forgotBtn.click()
  77  |     const modal = page.locator('#forgotPasswordModal')
  78  |     await expect(modal).toBeVisible()
  79  | 
  80  |     const closeBtn = page.getByRole('button', { name: /close|إغلاق/i }).first()
  81  |     await closeBtn.click()
  82  |     await expect(modal).toHaveClass(/hidden/)
  83  |   })
  84  | 
  85  |   test('CSP header is present on login page', async ({ page }) => {
  86  |     await page.goto(`${BASE_URL}/login.html`)
  87  |     const csp = await page.evaluate(() => {
  88  |       const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
  89  |       return meta?.getAttribute('content') || null
  90  |     })
  91  |     expect(csp).toBeTruthy()
  92  |     expect(csp).toContain("frame-ancestors 'none'")
  93  |   })
  94  | 
  95  |   test('no inline event handlers in login form', async ({ page }) => {
  96  |     await page.goto(`${BASE_URL}/login.html`)
  97  |     const hasInline = await page.evaluate(() => {
  98  |       const form = document.getElementById('loginForm')
  99  |       if (!form) return false
  100 |       return ['onclick', 'onsubmit'].some(h => form.hasAttribute(h))
  101 |     })
  102 |     expect(hasInline).toBe(false)
  103 |   })
  104 | 
  105 |   test('no console errors on load', async ({ page }) => {
  106 |     const errors: string[] = []
  107 |     page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  108 |     page.on('pageerror', err => errors.push(err.message))
  109 | 
  110 |     await page.goto(`${BASE_URL}/login.html`)
  111 |     await expect(page.getByLabel(/email|البريد/i).first()).toBeVisible({ timeout: 10000 })
  112 |     expect(errors.length).toBe(0)
  113 |   })
  114 | 
  115 |   test('password has minlength of 8', async ({ page }) => {
  116 |     await page.goto(`${BASE_URL}/login.html`)
```