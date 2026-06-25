# Session: Study Groups Feature Improvements

**Date:** 2026-06-24  
**Feature:** المجموعات الدراسية (Study Groups)  
**Goal:** تحسين ميزة المجموعات الدراسية بإضافة 7 تحسينات

---

## الهدف
تحسين ميزة المجموعات الدراسية من خلال:
1. إضافة نظام إشعارات Toast بدلاً من `alert()`
2. حماية `localStorage` من مشاكل SSR/hydration
3. إنشاء طبقة API خلفية (Supabase Edge Functions)
4. إضافة زر "مغادرة المجموعة"
5. إضافة إمكانية تعديل بيانات المجموعة
6. إنشاء تبويبة/صفحة "مجموعاتي"
7. تحويل نافذة "إنشاء مجموعة" المنبثقة إلى صفحة/تبويبة منفصلة

---

## القواعد
1. **عدم تغيير المنطق الحالي** — فقط إضافة ميزات جديدة بدون تعديل السلوك الموجود
2. **استخدام المكونات العامة** — إعادة استخدام `PrimaryButton`، `Dropdown`، أنماط التصميم الموجودة
3. **اختبار لكل ملف جديد** — كل ملف جديد يجب أن يكون له ملف اختبار مصاحب
4. **التحقق من البناء والاختبارات بعد كل مرحلة** — لا تقدم للمرحلة التالية إلا بعد نجاح المرحلة الحالية
5. **الترتيب:** Toast → localStorage SSR guard → API Layer → Leave Group → Edit Group → My Groups Tab → Create Group Page

---

## الخطوات

### المرحلة 1: نظام إشعارات Toast
- [ ] إنشاء `src/components/ui/Toast.tsx`
- [ ] إنشاء `src/components/ui/ToastContainer.tsx`
- [ ] إنشاء `src/hooks/useToast.ts`
- [ ] إنشاء `src/features/study-groups/src/hooks/useStudyGroupsToast.ts`
- [ ] تعديل `src/App.tsx` لإضافة ToastContainer
- [ ] تعديل `src/features/study-groups/index.ts`
- [ ] إنشاء اختبارات لكل ملف جديد
- [ ] تشغيل البناء والاختبارات

### المرحلة 2: حماية localStorage من SSR
- [ ] تعديل `useStudyGroupsActions.ts` (useStoredUser) — إضافة `mounted`
- [ ] تعديل `useStudyGroupsPage.ts` — استخدام `mounted`
- [ ] تعديل `CreateGroupModal.tsx` — شرط `!mounted`
- [ ] إنشاء/تحديث اختبارات
- [ ] تشغيل البناء والاختبارات

### المرحلة 3: طبقة API خلفية (Supabase Edge Functions)
- [ ] إنشاء `supabase/functions/study-groups/index.ts`
- [ ] إنشاء `src/features/study-groups/src/services/studyGroupsApi.ts`
- [ ] تعديل `src/features/study-groups/src/core/services/index.ts`
- [ ] تعديل `useStudyGroups.ts` لاستخدام API
- [ ] تعديل `useStudyGroupsActions.ts` لاستخدام API
- [ ] تعديل `useStudyGroupsPage.ts` لاستخدام API
- [ ] تعديل `types/index.ts` (إضافة UpdateGroupData)
- [ ] إنشاء اختبارات
- [ ] تشغيل البناء والاختبارات

### المرحلة 4: زر "مغادرة المجموعة"
- [ ] تعديل `GroupDetailsModal.tsx` — إضافة زرLeave
- [ ] تعديل `useStudyGroupsActions.ts` — إضافة handleLeaveGroup
- [ ] تعديل `useStudyGroupsPage.ts` — إضافة leavingId و onLeave
- [ ] تعديل `StudyGroupsHome.tsx` — تمرير Props
- [ ] إنشاء اختبارات
- [ ] تشغيل البناء والاختبارات

### المرحلة 5: تعديل بيانات المجموعة
- [ ] إنشاء `EditGroupModal.tsx`
- [ ] تعديل `GroupDetailsModal.tsx` — إضافة زر Edit
- [ ] تعديل `useStudyGroupsActions.ts` — إضافة handleEditGroup
- [ ] تعديل `useStudyGroupsPage.ts` — إضافة edit states
- [ ] تعديل `types/index.ts` — إضافة UpdateGroupData
- [ ] تحديث Edge Function (PATCH endpoint)
- [ ] إنشاء اختبارات
- [ ] تشغيل البناء والاختبارات

### المرحلة 6: تبويبة "مجموعاتي"
- [ ] إنشاء `MyGroupsPage.tsx`
- [ ] إنشاء `useMyGroups.ts`
- [ ] تعديل `StudyGroupsNavbar.tsx` — إضافة تبويبات
- [ ] تعديل `StudyGroupsHome.tsx` — دعم التبويبات
- [ ] تحديث Edge Function (GET /my-groups)
- [ ] تحديث API client (getMyGroups)
- [ ] تعديل `index.ts`
- [ ] إنشاء اختبارات
- [ ] تشغيل البناء والاختبارات

### المرحلة 7: تحويل "إنشاء مجموعة" إلى صفحة
- [ ] إنشاء `CreateGroupPage.tsx`
- [ ] تعديل `CreateGroupModal.tsx` — استخراج AlpineForm مشترك أو تبسيط
- [ ] تعديل `StudyGroupsHome.tsx` — إزالة النافذة المنبثقة، إضافة الشرط
- [ ] تعديل `StudyGroupsNavbar.tsx` (من المرحلة 6)
- [ ] تعديل `index.ts`
- [ ] إنشاء اختبارات
- [ ] تشغيل البناء والاختبارات النهائية

---

## أوامر البناء والاختبارات
```bash
# بناء المشروع
npm run build

# تشغيل جميع الاختبارات
npm test

# تشغيل اختبارات مجموعة معينة
npm test -- --run src/features/study-groups/

# تشغيل اختبار ملف محدد
npm test -- --run src/components/ui/Toast.test.tsx
```

---

## الحالة
✅ المراحل 1-7 مكتملة ومتحقق منها

### المرحلة 1: نظام إشعارات Toast
- [x] إنشاء `src/components/ui/Toast.tsx`
- [x] إنشاء `src/features/study-groups/src/hooks/useStudyGroupsToast.ts`
- [x] تعديل `src/App.tsx` لإضافة ToastContainer
- [x] تعديل `src/features/study-groups/index.ts`
- [x] إنشاء `tests/components/Toast.test.tsx`
- [x] تشغيل البناء والاختبارات (99 test files, 615 tests passed)

### المرحلة 2: حماية localStorage من SSR
- [x] تعديل `useStudyGroupsActions.ts` (useStoredUser) — إضافة `mounted`
- [x] تعديل `useStudyGroupsPage.ts` — استخدام `mounted`
- [x] تعديل `CreateGroupModal.tsx` — شرط `!mounted`
- [x] تحديث الاختبارات
- [x] تشغيل البناء والاختبارات

### المرحلة 3: طبقة API خلفية (Supabase Edge Functions)
- [x] إنشاء `supabase/functions/study-groups/index.ts`
- [x] إنشاء `src/features/study-groups/src/services/studyGroupsApi.ts`
- [x] تعديل `src/features/study-groups/src/core/services/index.ts`
- [x] تعديل `src/features/study-groups/src/services/studyGroup.supabase.ts` (إضافة `leaveGroup`, `updateGroup`, `getMyGroups`)
- [x] تعديل `src/features/study-groups/src/types/index.ts` (إضافة `UpdateGroupData`)
- [x] إنشاء `tests/features/study-groups/hooks/useStudyGroupsActions.extended.test.ts`
- [x] تشغيل البناء والاختبارات

### المرحلة 4: زر "مغادرة المجموعة"
- [x] تعديل `GroupDetailsModal.tsx` — إضافة زر Leave
- [x] تعديل `useStudyGroupsActions.ts` — إضافة handleLeaveGroup
- [x] تعديل `useStudyGroupsPage.ts` — إضافة leavingId و onLeave
- [x] تعديل `StudyGroupsHome.tsx` — تمرير Props
- [x] تحديث الاختبارات
- [x] تشغيل البناء والاختبارات

### المرحلة 5: تعديل بيانات المجموعة
- [x] إنشاء `EditGroupModal.tsx`
- [x] تعديل `GroupDetailsModal.tsx` — إضافة زر Edit
- [x] تعديل `useStudyGroupsActions.ts` — إضافة handleEditGroup
- [x] تعديل `useStudyGroupsPage.ts` — إضافة edit states
- [x] الـ Edge Function يدعم PATCH endpoint بالفعل
- [x] إنشاء `tests/features/study-groups/components/EditGroupModal.test.tsx`
- [x] تشغيل البناء والاختبارات

### المرحلة 6: تبويبة "مجموعاتي"
- [x] إنشاء `MyGroupsPage.tsx`
- [x] تعديل `studyGroupService` بإضافة `getMyGroups`
- [x] تعديل `App.tsx` — إضافة route `/dashboard/study-groups/my`
- [x] تعديل `index.ts` — تصدير MyGroupsPage
- [x] إنشاء `tests/features/study-groups/pages/MyGroupsPage.test.tsx`
- [x] تشغيل البناء والاختبارات (22 test files, 178 tests passed)

### المرحلة 7: تحويل "إنشاء مجموعة" إلى صفحة
- [x] إنشاء `CreateGroupPage.tsx`
- [x] تعديل `App.tsx` — إضافة route `/dashboard/study-groups/create`
- [x] تعديل `index.ts` — تصدير CreateGroupPage
- [x] إنشاء `tests/features/study-groups/pages/CreateGroupPage.test.tsx`
- [x] تشغيل البناء والاختبارات النهائية (23 test files, 183 tests passed)
