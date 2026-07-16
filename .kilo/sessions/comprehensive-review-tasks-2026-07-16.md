# مهمة مراجعة الشفرة الشاملة — SVU Community v3.0.0

## الهدف
تنفيذ كافة التوصيات الواردة في تقرير المراجعة الشامل للمشروع، مع إصلاح مشاكل الأمان والأداء والجودة، وتتبع المهام بشكل منفصل مع كوميت بعد كل مهمة.

## الحالة العامة
### تم إنجازه من الجلسة السابقة (غير مコミتم بعد)
- إصلاح XSS في RichText.tsx باستخدام DOMPurify
- استبدال document.write في export.ts بـ Blob URL
- إزالة مفتاح التشفير الضعيف من GuestContext.tsx
- تنظيف أخطاء OCR من أسماء متغيرات البيئة
- إضافة تنظيف PII في ErrorBoundary.tsx
- حذف ErrorBoundary.tsx المكرر من src/components/shared/
- إزالة ZodType<any> من auth.schema.ts
- إصلاح any[] في export.ts
- تحسين الاستعلامات المتتالية بـ Promise.all في studyGroup.supabase.ts و reviewService.supabase.ts
- إصلاح Math.max(...[]) في Analytics.tsx
- إضافة React.memo لمكونات لوحة التحكم والتحليلات
- إزالة cn() المكرر من cva.ts
- تحديث استيرادhooks في ProfileSettingsForm و SecuritySettingsForm
- إنشاء constants.ts واستخراج الأرقام السحرية
- حذف hooks المكررة من src/components/dashboard/

### المهام المتبقية
| # | المهمة | الحالة |
|---|--------|--------|
| 1 | تنظيف catch الفارغة في GuestContext.tsx و useRateLimit.ts | 🔄 في التقدم |
| 2 | إصلاح التعبيرات النوعية غير الآمنة في useAuthForm.ts و NotificationManagement.tsx | ⏳ قيد الانتظار |
| 3 | إضافة React.memo ل Dashboard.tsx | ⏳ قيد الانتظار |
| 4 | إضافة تعليقات للمنطق المعقد في useParticleCanvas.ts و GuestContext.tsx | ⏳ قيد الانتظار |
| 5 | توحيد أنماط الاستيراد | ⏳ قيد الانتظار |
| 6 | تقسيم المكونات الكبيرة (NotificationManagement, UserManagement, VerificationPanel) | ⏳ قيد الانتظار |
| 7 | زيادة staleTime لتخزين إحصائيات المراجعات مؤقتًا | ⏳ قيد الانتظار |
| 8 | تشغيل التحقق (lint, build, test) | ⏳ قيد الانتظار |

## التقدم
- [x] إنشاء ملف المهمة والهدف
- [ ] المهمة 1: تنظيف catch الفارغة
- [ ] المهمة 2: إصلاح التعبيرات النوعية غير الآمنة
- [ ] المهمة 3: إضافة React.memo ل Dashboard.tsx
- [ ] المهمة 4: إضافة تعليقات للمنطق المعقد
- [ ] المهمة 5: توحيد أنماط الاستيراد
- [ ] المهمة 6: تقسيم المكونات الكبيرة
- [ ] المهمة 7: زيادة staleTime لتخزين إحصائيات المراجعات
- [ ] المهمة 8: تشغيل التحقق