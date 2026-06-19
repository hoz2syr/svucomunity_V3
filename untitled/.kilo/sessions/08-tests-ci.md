# جلسة 08 — اختبارات و CI

## الهدف
تحديث الاختبارات والتحقق من أن CI تغطي البنية الجديدة.

## النطاق
- تحديث tests الموجودة
- إضافة service tests
- التأكد من أن Vitest يقرأ tests
- تثبيت mocks للـ jsdom

## الملفات المرتبطة
- `tests/**`
- `vitest.config.ts`
- `tests/setup.ts`
- `tsconfig.json`

## الخطوات
1. مراجعة tests الحالية.
2. إضافة tests للـ services.
3. إنشاء `tests/setup.ts` لتثبيت canvas/scrollTo/matchMedia mocks.
4. تحديث `vitest.config.ts` لاستخدام setup file.
5. تشغيل `npm run test`.

## التحقق
- `npm run test`: نجح، 11 ملفات اختبار و36 اختباراً.
- `npm run lint`: نجح.

## النتيجة
مكتملة. Vitest يكتشف tests في `tests/**/*.test.{ts,tsx}` و service tests تعمل.

## المخاطر
- تغيير config بدون سبب.
- كسر test discovery.
