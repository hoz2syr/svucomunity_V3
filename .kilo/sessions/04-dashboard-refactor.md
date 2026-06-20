# جلسة 04 — تفكيك Dashboard

## الهدف
تقسيم `DashboardPage` إلى مكونات أصغر وhooks واضحة.

## النطاق
- استخراج `DashboardHeader`
- استخراج `DashboardLayout`
- استخراج `EmptyDashboardState`
- نقل state إلى hooks
- إبقاء `src/pages/Dashboard.tsx` re-export فقط

## الملفات المرتبطة
- `src/pages/Dashboard.tsx`
- `src/pages/Dashboard/Dashboard.tsx`
- `src/pages/Dashboard/DashboardHeader.tsx`
- `src/pages/Dashboard/DashboardLayout.tsx`
- `src/pages/Dashboard/EmptyDashboardState.tsx`
- `src/pages/Dashboard/useDashboardNotifications.ts`
- `src/pages/Dashboard/useDashboardState.ts`

## الخطوات
1. عزل UI fragments.
2. نقل logic إلى hooks.
3. الحفاظ على behavior الحالي.
4. تحديث tests للـ page/components.

## التحقق
- `npm run lint`: نجح.
- `npm run test`: نجح.
- `npm run build`: نجح.

## النتيجة
مكتملة. Dashboard مقسم إلى page layout و components و hooks منفصلة.

## المخاطر
- تغيير layout أو state behavior.
- كسر profile menu أو notifications.
