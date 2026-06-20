# جلسة 07 — تنظيف Landing components

## الهدف
تنظيم landing components دون تغيير التصميم الحالي.

## النطاق
- `Home`
- `LandingSections`
- `InteractiveMap`

## الملفات المرتبطة
- `src/pages/Home.tsx`
- `src/components/LandingSections.tsx`
- `src/components/InteractiveMap.tsx`
- `src/components/landing/**`

## الخطوات
1. مراجعة layout الحالي.
2. فصل repeated sections إلى components فردية.
3. جعل `LandingSections.tsx` barrel exports فقط.
4. الحفاظ على التصميم.
5. تنظيف comments غير الضرورية في `InteractiveMap.tsx`.

## التحقق
- `npm run lint`: نجح.
- `npm run build`: نجح.

## النتيجة
مكتملة. Landing sections مفصولة مع الحفاظ على التصميم والسلوك.

## المخاطر
- تغيير visual output.
- كسر animations.
