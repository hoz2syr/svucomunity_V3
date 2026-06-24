# ميزة المجموعات الدراسية

## نظرة عامة

تتيح هذه الميزة للطلاب إنشاء مجموعات دراسية والانضمام إليها بناءً على المادة والتخصص والفصل الدراسي. توفر واجهة بحث وفلترة متقدمة مع حالات تحميل وخطأ محددة.

## التقنيات المستخدمة

- React 18+ مع TypeScript
- Supabase كقاعدة بيانات
- Tailwind CSS للتصميم
- Vitest + Testing Library للاختبارات
- Lucide React للأيقونات

## بنية المجلد

```
src/features/study-groups/
├── components/          # مكونات واجهة المستخدم
├── src/
│   ├── core/
│   │   └── services/   # خدمات Supabase
│   ├── hooks/          # Hooks مخصصة
│   ├── pages/          # الصفحات الرئيسية
│   ├── services/       # خدمات إضافية (كatalog المواد)
│   └── types/          # تعريفات TypeScript
├── tests/              # ملفات الاختبار
└── docs/               # التوثيق
```

## الحالة الحالية

- ✅ 13 مكون واجهة
- ✅ 18 ملف اختبار
- ✅ 3 Hooks مخصصة
- ✅ 2 خدمة Supabase
- ✅ استراتيجية فلترة وفرز كاملة

## التحسينات المنفذة

1. ✅ إنشاء `useDebounce` hook مشترك
2. ✅ إضافة `StudyGroupEnriched` type
3. ✅ تنظيف `is_admin` check مع `useMemo`
4. ✅ تنظيف `core/storage` الفارغ
5. ✅ تحسين اعتماديات Hooks

## المشاكل المعروفة

- ⚠️ استخدام `alert()` في `useStudyGroupsActions` (قيد الإصلاح)
- ⚠️ `localStorage` بدون حماية SSR كاملة

## الصفحات المرتبطة

- [قصص المستخدم](./user-stories.md)
- [مخططات UML](./diagrams.md)
- [واجهات Backend](./api-endpoints.md)
