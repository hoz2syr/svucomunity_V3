# جلسة 01 — تثبيت حدود Storybook

## الهدف
منع أي production code من الاعتماد على `src/stories`، وتنظيف حدود Storybook.

## النطاق
- إصلاح `src/components/layout/Header.tsx`
- إزالة imports من `src/stories`
- تنظيف `src/stories`
- إبقاء stories منفصلة عن production code

## الملفات المرتبطة
- `src/components/layout/Header.tsx`
- `src/stories/**`
- `.storybook/**`

## الخطوات
1. إزالة أي import من production files إلى `src/stories`.
2. نقل أو حذف scaffold غير المستخدم.
3. إنشاء stories حقيقية لمكونات UI موجودة.
4. التحقق من أن Storybook لا يعتمد على production imports.

## التحقق
- `npm run lint`: نجح.
- `npm run build-storybook`: نجح.
- grep أكد عدم وجود imports من production إلى `src/stories`.

## النتيجة
مكتملة. أصبح `Header` مكوناً إنتاجياً بسيطاً، و `src/stories` يحتوي فقط على stories/README.

## المخاطر
- حذف files دون التأكد من عدم استخدامها.
- ترك imports مكسورة.
