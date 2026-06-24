# Task: Fix LocalFirstTestStorage Split-Brain (P0)

## 🔴 المشكلة
يوجد زوج من الـ `LocalFirstTestStorage` المتعارضين داخل مشروع `svu-community-web`:

| | src/lib/examStorage.ts → src/features/exam/src/core/storage/localStorageTestStorage.ts | src/features/exam/src/core/adapters/localStorageTestStorage.ts |
|---|---|---|
| **الاسم** | `testStorage` (122 سطر) | `localStorageTestStorage` (75 سطر) |
| **hydrateFromServer** | يدمج محلي + خادم (merge) | يمسح كل المحلي (overwrite) |
| **Pending Sync Queue** | ✅ `enqueuePending`, `drainPendingSync`, `getPendingSyncCount` | ❌ غير موجود |
| **getCurrentUserId** | `if (this.currentUserId) return` (falsy check) | `if (this.currentUserId !== null) return` (strict check) |

## ⚠️ الخطر
أي Hook يحفظ اختباراً عبر النسخة الثانية (`adapters/`) ثم يقرأ عبر النسخة الأولى (`storage/`) → **فقدان بيانات Pending Queue وعدم مزامنة مع الخادم**.

## 📋 التنفيذ المخطط

### الخطوة 1: إنشاء alias في الملف الكامل
- **الملف:** `src/features/exam/src/core/storage/localStorageTestStorage.ts`
- **التعديل:** إضافة `export const localStorageTestStorage = testStorage;` في نهاية الملف
- **الهدف:** تصدير نفس الـ instance تحت كلا الاسمين

### الخطوة 2: تحديث examStorage.ts
- **الملف:** `src/lib/examStorage.ts`
- **التعديل:** التحقق من صحة الاستيراد الحالي (لا تغيير مطلوب)

### الخطوة 3: تحديث exam-cleanup.ts
- **الملف:** `src/lib/exam-cleanup.ts`
- **التعديل:** تحديث مسار الاستيراد من `adapters/` إلى `storage/`

### الخطوة 4: تحديث useCoreSavedTests.ts
- **الملف:** `src/features/exam/src/hooks/useCoreSavedTests.ts`
- **التعديل:** تحديث مسار الاستيراد من `adapters/` إلى `storage/`

### الخطوة 5: تحديث useTestMigration.ts
- **الملف:** `src/features/exam/src/hooks/useTestMigration.ts`
- **التعديل:** تحديث مسار الاستيراد من `adapters/` إلى `storage/`

### الخطوة 6: تحديث useCorePlayTest.ts
- **الملف:** `src/features/exam/src/hooks/useCorePlayTest.ts`
- **التعديل:** تحديث مسار الاستيراد من `adapters/` إلى `storage/`

### الخطوة 7: تحديث testService.ts
- **الملف:** `src/features/exam/src/core/services/testService.ts`
- **التعديل:** التحقق من عدم وجود استيراد للstorage (لا تغيير مطلوب)

### الخطوة 8: تحديث index.ts في services
- **الملف:** `src/features/exam/src/core/services/index.ts`
- **التعديل:** التحقق من صحة الاستيراد الحالي (لا تغيير مطلوب)

### الخطوة 9: حذف الملف الناقص
- **الملف:** `src/features/exam/src/core/adapters/localStorageTestStorage.ts`
- **التعديل:** حذف كامل

### الخطوة 10: تشغيل الاختبارات
- **الأمر:** `npm test` أو `npx vitest run`
- **الهدف:** كل الاختبارات تمر

### الخطوة 11: تشغيل البناء
- **الأمر:** `npm run build` أو `npx tsc --noEmit && vite build`
- **الهدف:** بناء ناجح بدون أخطاء

## 📊 الحالة النهائية

| الخطوة | الحالة | التاريخ |
|--------|--------|---------|
| 1. إنشاء ملف المهمة | ✅ مكتمل | 2026-06-24 |
| 2. إضافة alias `localStorageTestStorage` | ✅ مكتمل | 2026-06-24 |
| 3. تحديث `src/lib/examStorage.ts` | ✅ مكتمل | 2026-06-24 |
| 4. تحديث `src/lib/exam-cleanup.ts` | ✅ مكتمل | 2026-06-24 |
| 5. تحديث `useCoreSavedTests.ts` | ✅ مكتمل | 2026-06-24 |
| 6. تحديث `useTestMigration.ts` | ✅ مكتمل | 2026-06-24 |
| 7. تحديث `useCorePlayTest.ts` | ✅ مكتمل | 2026-06-24 |
| 8. تحديث ملفات الاختبارات (2 ملفات) | ✅ مكتمل | 2026-06-24 |
| 9. حذف `adapters/localStorageTestStorage.ts` | ✅ مكتمل | 2026-06-24 |
| 10. تشغيل الاختبارات | ✅ 602 اختبار نجحت (97 ملف) | 2026-06-24 |
| 11. تشغيل البناء | ✅ نجح في 9.22s | 2026-06-24 |

## ✅ النتيجة النهائية

تم **توحيد** نسختي `LocalFirstTestStorage` في ملف واحد هو `src/features/exam/src/core/storage/localStorageTestStorage.ts`.

- `testStorage` ← الاسم الرسمي
- `localStorageTestStorage` ← alias يُشير لنفس الـ instance

الملف المختزل `src/features/exam/src/core/adapters/localStorageTestStorage.ts` تم حذفه.
