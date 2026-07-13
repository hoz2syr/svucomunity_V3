# OCR Proxy Fix Session — 2026-07-13

## الهدف
حل خطأ "Edge Function returned a non-2xx status code" في دالة `ocr-proxy` Supabase Edge Function.

## النطاق
- `supabase/functions/ocr-proxy/index.ts` — إصلاح معالجة الأخطاء في Edge Function
- `src/features/schedule-extraction/services/ocrParser.ts` — تحسين معالجة الأخطاء في العميل
- لا يتطلب تعديل migrations أو auth

## الملفات المرتبطة
- `supabase/functions/ocr-proxy/index.ts`
- `src/features/schedule-extraction/services/ocrParser.ts`
- `.env.local`
- `.github/workflows/ci.yml`

## الخطوات

### 1. تشخيص المشكلة
- الخطأ "Edge Function returned a non-2xx status code" يعني أن الطلب يصل الدالة لكن الدالة تُرجع حالة خطأ
- السر `OCR_API_KEY` موجود بالفعل في Supabase Dashboard (مُحدّث 12 Jul 23:43)
- المشكلة ليست في غياب السر، بل في **معالجة الاستجابة من OCR.space**

### 2. تحديد السبب الجذري
- السطر 69 في `ocr-proxy/index.ts`: `const ocrData = await ocrResponse.json();`
- إذا أرجع OCR.space HTML (صفحة خطأ) بدلاً من JSON، ينشئ استثناء غير معالج
- Deno يُرجع 500 مع HTML، و Supabase JS client لا يستطيع تحليله
- يظهر للمستخدم: "Edge Function returned a non-2xx status code" بدون تفاصيل

### 3. الإصلاح في Edge Function
- إضافة try-catch حول `await ocrResponse.json()`
- إذا فشل التحليل، نُرجع 502 مع رسالة واضحة: `OCR_UPSTREAM_ERROR: <status> <partial_text>`
- هذا يضمن أن العملاء دائماً يحصلون على JSON قابل للتحليل

### 4. الإصلاح في العميل (ocrParser.ts)
- تنظيف الفحوصات المكررة وغير المنتظمة
- تبسيط منطق معالجة الأخطاء
- الحفاظ على رسائل عربية واضحة للمستخدم

## التحقق
- ✅ جميع الاختبارات نجحت: 102 ملف، 630 اختبار
- ✅ TypeScript type check: لا أخطاء
- ✅ Vite build: نجح في 9.54s

## النتيجة
- Edge Function الآن تُرجع دائماً JSON حتى في حالة فشل OCR.space
- العميل يحصل على رسائل خطأ واضحة وقابلة للتصنيف
- تم إزالة الفحوصات المكررة من `ocrParser.ts`

## المخاطر
- يجب إعادة نشر `ocr-proxy` Edge Function لتطبيق الإصلاح
- إذا كان OCR.space يفرض quota جديدة، قد تحتاج إلى ترقية الخطة
