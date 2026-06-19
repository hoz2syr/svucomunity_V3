# جلسة 02 — بناء Service Layer لـ Supabase

## الهدف
نقل كل عمليات Supabase خارج pages/components إلى services واضحة.

## النطاق
- إنشاء `src/services/*`
- تثبيت lazy client behavior
- منع أي crash عند نقص `.env.local`

## الملفات المرتبطة
- `src/lib/supabase.ts`
- `src/services/auth.service.ts`
- `src/services/profile.service.ts`
- `src/services/notification.service.ts`
- `src/services/account.service.ts`
- `src/services/environment.service.ts`
- `src/services/index.ts`

## الخطوات
1. إنشاء service layer.
2. نقل operations من pages/components.
3. تثبيت error handling و no-env checks.
4. إضافة tests عند الحاجة.

## التحقق
- `npm run lint`: نجح.
- `npm run test`: نجح.
- `npm run build`: نجح.
- grep أكد أن `getSupabaseClient`/`supabase.` موجودان فقط داخل `src/lib/supabase.ts` و `src/services/**`.

## النتيجة
مكتملة. كل عمليات Supabase تمر عبر `src/lib/supabase.ts` أو `src/services/**`.

## المخاطر
- تغيير behavior بدون tests.
- كسر auth/session flow.
