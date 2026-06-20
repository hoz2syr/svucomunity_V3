# جلسة 03 — إعادة تنظيم Auth flow

## الهدف
تنظيم login/register/callback/forgot password في حدود واضحة.

## النطاق
- `Login`
- `Register`
- `AuthCallback`
- `ForgotPasswordModal`
- `AuthContext`

## الملفات المرتبطة
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/pages/AuthCallback.tsx`
- `src/components/shared/ForgotPasswordModal.tsx`
- `src/contexts/AuthContext.tsx`
- `src/services/auth.service.ts`

## الخطوات
1. مراجعة flow الحالي.
2. فصل UI عن service calls.
3. توحيد error handling و missing-env handling.
4. إضافة/تحديث tests.

## التحقق
- `npm run lint`: نجح.
- `npm run test`: نجح.
- `npm run build`: نجح.
- `tests/auth.test.tsx` و `tests/services/auth.service.test.ts` يغطيان auth flow.

## النتيجة
مكتملة. صفحات auth تستخدم services ولا تحتوي على Supabase calls مباشرة.

## المخاطر
- تغيير auth behavior.
- كسر Google OAuth.
