# جلسة 06 — توحيد Types و Validation

## الهدف
توحيد الأنماط والـ validation في مكان واحد.

## النطاق
- `Profile`
- `Notification`
- auth input types
- security input types
- إزالة casting غير الآمن قدر الإمكان

## الملفات المرتبطة
- `src/types/profile.ts`
- `src/types/notification.ts`
- `src/types/auth.ts`
- `src/types/canvas.ts`
- `src/types/supabase.ts`
- `src/types/index.ts`
- `src/schemas/auth.schema.ts`
- `src/stores/notificationStore.ts`

## الخطوات
1. إنشاء types موحدة.
2. تحديث imports.
3. استخدام Zod schemas للـ auth/profile/security validation.
4. تحديث tests.
5. التحقق من عدم وجود `any` في `src`.

## التحقق
- `npm run lint`: نجح.
- `npm run test`: نجح.
- grep أكد عدم وجود `any` في `src`.

## النتيجة
مكتملة. الأنماط والـ validation موحدة عبر types/schemas/services.

## المخاطر
- كسر type compatibility.
- تغيير runtime behavior بالخطأ.
