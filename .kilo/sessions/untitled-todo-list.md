1: # 📋 قائمة المهام المطلوب تنفيذها لمجلد `untitled/`
2: 
3: ## 🎯 الهدف النهائي
4: تحويل المشروع إلى واجهة أمامية إنتاجية، آمنة، موثقة، وناجحة اختبارياً، قابلة للنشر على **Cloudflare Pages + Supabase**.
5: 
6: ---
7: 
8: ## 🔴 عالية الأولوية — الأمان والثغرات
9: 
10: ### 1. ✅ XSS Verification — تم التحقق، لا مشكلة
11: - **الحالة:** لا يوجد `dangerouslySetInnerHTML` فعلي في المكونات
12: 
13: ### 2. ✅ زر Notifications — تمت إضافة dropdown تفاعلي
14: - **الحالة:** يعمل مع `supabase.from('notifications')` + جدول فعلي في المايجريشن
15: 
16: ### 3. ✅ Fake Save Fix — تم الإصلاح
17: - **الحالة:** `Modals.tsx` يحفظ فعلياً في Supabase
18: 
19: ### 4. ✅ ErrorBoundary محسّن + Sentry
20: - **الحالة:** `ErrorBoundary.tsx` + `src/main.tsx`
21: 
22: ### 5. ⚠️ Props Spreading Fix — partial
23: - **الحالة:** `InputField.tsx` يستخدم `SafeInputAttrs` لكن forwardRef غير مكتمل
24: 
25: ### 6. ✅ CSP Headers — تمت الإضافة
26: 
27: ### 7. ✅ حذف الحساب — Edge Function only
28: - **الحالة:** تمت إزالة `admin.deleteUser` من العميل؛ الحذف يعتمد على `supabase/functions/delete-account/index.ts` فقط
29: 
28: ### 8. ✅ الحذف المزدوج — تم الإصلاح
29: - **الحالة:** `deleteOwnAccount()` في `supabase.ts` يعتمد على Edge Function فقط، ولا يوجد حذف مزدوج
30: 
31: ### 9. 🟠 CSRF Protection — مفقودة
32: - **الحالة:** النماذج لا تستخدم CSRF tokens
33: 
34: ### 10. 🟠 Rate Limit — حالياً localStorage فقط
35: - **الحالة:** يحتاج نقل إلى Supabase (server-side)
36: 
37: ---
38: 
39: ## 🟡 متوسطة الأولوية — تحسينات تقنية
40: 
41: ### 11. ✅ React Hook Form + Zod للنماذج
42: - **الحالة:** تم ترحيل `Login.tsx`, `Register.tsx`, `Modals.tsx`
43: - `src/schemas/auth.schema.ts` يحتوي جميع السكامات
44: 
45: ### 12. ✅ React Query added + QueryClientProvider
46: - **الحالة:** `src/lib/queryClient.ts` + `App.tsx`
47: 
48: ### 13. ✅ Zustand added
49: - **الحالة:** `src/stores/uiStore.ts`, `src/stores/notificationStore.ts`
50: 
51: ### 14. ⚠️ i18n System — معطل حسب توجيه المستخدم
52: - **الحالة:** المستخدم أوصى بعدم تنفيذ i18n، النصوص العربية تبقى hardcoded
53: 
54: ### 15. ⚠️ تقسيم Dashboard.tsx و Modals.tsx
55: - **الحالة:**Dashboard.tsx 297 سطر، Modals.tsx 246 سطر — يحتاجان تقسيم
56: 
57: ---
58: 
59: ## 🔴 عالية الأولوية — بنية تحتية
60: 
61: ### 16. ✅ ملفات Supabase Infrastructure الفعلية
62: - **الحالة:**
63:   - `supabase/migrations/001_init_profiles.sql`
64:   - `supabase/migrations/002_init_notifications.sql`
65:   - `supabase/seed/profiles.sql`
66:   - `supabase/seed/notifications.sql`
67:   - `supabase/functions/delete-account/index.ts`
68: 
69: ### 17. ✅ SPA routing — `public/_redirects`
70: 
71: ### 18. ✅ `vite.config.ts` محدّت
72: 
73: ### 19. ✅ Rate Limiting hook — `src/hooks/useRateLimit.ts`
74: 
75: ### 20. ✅ Sentry — `src/main.tsx` (prod-only)
76: 
77: ---
78: 
79: ## 🔴 عالية الأولوية — CI/CD & Testing
80: 
81: ### 21. ⚠️ Vitest config + اختبارات أساسية — تجميد تعديل الاختبارات
82: - **الحالة:** `vitest.config.ts` موجود
83: - `tests/InputField.test.tsx` ✅ ينجح
84: - `tests/auth.test.tsx` ✅ ينجح (3/3)
85: - `tests/Dashboard.test.tsx` ❌ محدّق مؤقتاً — لا يتم تعديل الملف حتى إصلاح سبب الجذر في `Dashboard.tsx`/`Modals.tsx`
86: - `tests/rateLimit.ts.spec.ts` ❌ غير موجود فعلياً
87: - **قرار:** عدم إنشاء نسخ اختبار جديدة لـ Dashboard.test.tsx في هذه الجولة
88: 
89: ### 22. ⚠️ GitHub Actions CI/CD workflow
90: - **الحالة:** `.github/workflows/ci.yml` موجود لكن يحتاج مراجعة
91: 
92: ### 23. ⚠️ Cloudflare Pages CI config
93: - **الحالة:** يلزم ربط GitHub repo بـ Cloudflare Pages Dashboard
94: 
95: ### 24. ✅ ERD + Component Tree
96: - **الحالة:** تم إنشاؤهما في `docs/diagrams/`
97: 
98: ### 25. ✅ Storybook init
99: - **الحالة:** تمت التثبيت بـ `npx storybook@latest init --type react`
100: 
101: ---
102: 
103: ## 🟢 منخفضة الأولوية — احترافية
104: 
103: ### 26. ❌ Bundle Analysis
104: ### 27. ❌ Husky + lint-staged
105: ### 28. ❌ React Helmet + SEO tags
106: ### 29. ❌ Lazy loading للصفحات
107: 
108: ---
109: 
110: ## 📊 ملخص المهام حسب الأولوية
111: 
112: | الأولوية | العدد | الحالة |
113: |----------|-------|--------|
114: | 🔴 عالية | 25 | ✅ 19 مكتملة / ⚠️ 6 قيد الإصلاح |
115: | 🟡 متوسطة | 5 | ✅ 3 مكتملة / ⚠️ 2 قيد الإصلاح |
116: | 🟢 منخفضة | 4 | ❌ غير منفذة |
117: 
118: ---
119: 
120: ## 🚀 خطة التنفيذ الحالية
121: 
122: ### المرحلة 1: الأمان — ✅ مكتملة جزئياً
123: - [x] Task 1: XSS Verification
124: - [x] Task 3: Fake Save Fix
125: - [x] Task 6: CSP Headers
126: - [x] Task 4: ErrorBoundary محسّن
127: - [x] Task 7: إزالة admin.deleteUser من العميل
128: - [x] Task 8: إصلاح الحذف المزدوج
129: - [x] Task 11-16: Supabase Infrastructure Files + RHF + Zustand + React Query
130: - [ ] Task 5: إصلاح forwardRef في InputField
131: - [ ] Task 9: CSRF Protection
132: - [ ] Task 10: نقل Rate Limit إلى Supabase
133: 
133: ### المرحلة 2: CI/CD & Testing — 🔄 قيد التنفيذ
134: - [x] Task 21a: InputField.test.tsx ✅
135: - [x] Task 21b: auth.test.tsx ✅
136: - [ ] Task 21c: Dashboard.test.tsx ⚠️ مُجمّد حتى إصلاح `Dashboard.tsx`/`Modals.tsx`
137: - [ ] Task 22: GitHub Actions workflow مراجعة
138: - [ ] Task 23: Cloudflare Pages CI
139: 
140: ### المرحلة 3: احترافية — في الانتظار
141: - [ ] Task 26: Bundle Analysis
142: - [ ] Task 27: Husky + lint-staged
143: - [ ] Task 28: React Helmet + SEO
144: - [ ] Task 29: Lazy loading
145: 
146: ---
147: 
148: ## 📌 الملاحظات
149: 
149: - جميع الملفات المذكورة موجودة في مجلد `untitled/` فقط
150: - i18n معطل حسب توجيه المستخدم
151: - المشروع يعمل حالياً على port 3000
152: - Sentry يعمل فقط في وضع الإنتاج وعند توفر `VITE_SENTRY_DSN`
153: - عند الانتهاء من كل مهمة، يجب تحديث حالتها في الجدول
154: - Dashboard.test.tsx: لا يتم تعديل الملف حتى يتم إصلاح سبب الجذر في `Dashboard.tsx` أو `Modals.tsx`
155: 
156: ---
157: 
158: *تم تحديث هذا الملف في: 2026-06-18 — الجلسة الجارية*
159: 