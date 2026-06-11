# 🤖 Task Sub-Agent Workflow — خطة العمل الهرمية

> **مرتبط بـ:** `docs/implementation-plan.md`  
> **الإصدار:** 1.0  
> **التاريخ:** 2026-06-11  
> **الحالة:** 🚧 جاري الإعداد

---

## 📐 هيكل الهرم (Hierarchy Overview)

```
PHASE LEAD (1)
└── WORKSTREAM LEADS (8)
    └── EXECUTION SUB-AGENTS (N per workstream)
        └── ATOMIC TASKS (Individual actions)
```

| المستوى | الدور | العدد | المسؤولية |
|--------|------|------|-----------|
| **Phase Lead** | إدارة مرحلة كاملة | 1 لكل مرحلة | تنسيق، مراجعة، إبلاغ |
| **Workstream Lead** | إدارة تيار عمل | 1 لكل تيار | تقسيم، تتبع، ضمان الجودة |
| **Execution Sub-Agent** | تنفيذ مهمة محددة | N تلقائي | تنفيذ، فحص، تقرير |
| **Atomic Task** | وحدة عمل واحدة | يمكن وضعها كـ checklist | تنفيذ بلا تفكير |

---

## 🏗️ المرحلة 0: تحضير infrastructure (إلزامي قبل كل المراحل)

> **مرتبط:** لا يوجد في الخطة الأساسية — هذه البنية التحتية

### Task 0.1 — إنشاء هيكل Task Management
**الأداة:** `todowrite` (built-in)  
**المدخلات:** `docs/implementation-plan.md`  
**المخرجات:** قائمة مهام كاملة مرتبطة بكل قسم من الخطة

```
Prompt: "أنشئ TodoList كاملة من docs/implementation-plan.md
- قسم لكل مرحلة (Phase 1-8)
- كل مهمة في الخطة = مهمة منفصلة في الـ Todo
- ضع الأولوية: P0 (فادح)، P1 (عالي)، P2 (متوسط)، P3 (منخفض)
- لا تبدأ التنفيذ — فقط أنشئ القائمة"
```

### Task 0.2 — تكوين Context لكل Sub-Agent
**الأداة:** `skill` + `task`  
**المدخلات:** ملف `docs/implementation-plan.md`  
**المخرجات:** context template لكل نوع sub-agent

| Sub-Agent Type | Skills المطلوبة | Context |
|---------------|-----------------|---------|
| `fix-engineer` | backend-code-review, security-best-practices | Fatal errors F1-F8 |
| `auditor` | backend-code-review, security-best-practices, tech-debt-tracker | Audit checklist |
| `port-files` | codebase-onboarding, backend-code-review | Source/dest mappings |
| `creator` | engineering-skills, senior-backend | Missing file specs |
| `tester` | playwright-pro, tdd-guide, coverage | Test matrix |
| `docs-writer` | docx, doc | Architecture + API docs |
| `security-auditor` | senior-secops, security-best-practices | Security checklist |

### Task 0.3 — إنشاء Agent Runbook
**الأداة:** `write`  
**المسار:** `.kilo/agents/svu-workflow/runbook.md`  
**المحتوى:** تعليمات تشغيل كل sub-agent، معايير القبول، مراحل التصعيد

---

## ⚙️ المرحلة 1: إصلاح الأخطاء الفادحة (Fatal Errors F1-F8)

> **مرتبط:** § 1.4 في الخطة  
> **المتتالية:** إلزامية — لا يمكن الانتقال بدونها  
> **المدة:** 1-2 يوم

### PHASE LEAD:phase-1-fixer

```yaml
role: Phase Lead
phase: 1
title: إصلاح الأخطاء الفادحة
priority: P0
depends_on: [Phase 0 complete]
blocks: [Phase 2, 3, 4, 5]
deliverable: npm install يعمل بدون أخطاء
```

#### Workstream 1.1 — إصلاح Package Management (F1, F2, F5, F8)

| # | المهمة | الملفات | النوع | المعيار |
|---|-------|---------|------|---------|
| 1.1.1 | إصلاح `packages/config/package.json` | `packages/config/package.json` | edit | JSON صالح، يحتوي name, version, main |
| 1.1.2 | إصلاح `packages/supabase-client/package.json` | `packages/supabase-client/package.json` | edit | JSON صالح، peerDependencies على supabase |
| 1.1.3 | إصلاح `packages/types/package.json` | `packages/types/package.json` | edit | JSON صالح،typescript كـ peerDep |
| 1.1.4 | إصلاح `packages/utils/package.json` | `packages/utils/package.json` | edit | JSON صالح |
| 1.1.5 | إضافة `dependencies` لـ `apps/admin/package.json` | `apps/admin/package.json` | edit | react, react-dom, vite, @vitejs/plugin-react |
| 1.1.6 | إضافة `dependencies` لـ `apps/courses/package.json` | `apps/courses/package.json` | edit | + @xyflow/react, dagre, tailwindcss |
| 1.1.7 | إضافة `dependencies` لـ `apps/schedule/package.json` | `apps/schedule/package.json` | edit | react, vite, tailwindcss |
| 1.1.8 | إضافة `dependencies` لـ `apps/web/package.json` | `apps/web/package.json` | edit | vite |
| 1.1.9 | إصلاح `apps/web/vite.config.js` | `apps/web/vite.config.js` | edit | إما `.mjs` أو `package.json` فيه `type:module` |
| 1.1.10 | إصلاح `apps/courses/package.json` build | `apps/courses/package.json` | edit | إما إزالة `-b` أو إضافة `composite: true` |

**Sub-Agent Prompt (1.1):**
```
أنت مهندس إصلاح Package Managment. هدفك:
1. اقرأ كل ملف package.json في工作任务 1.1.1-1.1.8
2. تأكد أن كل ملف JSON صالح (run: node -e "JSON.parse(...)")
3. أضف dependencies الناقصة حسب كل تطبيق
4. أصلح vite.config.js حسب 1.1.9
5. أصلح build script حسب 1.1.10
6. بعد كل تعديل تحقق بالـ verify command
لا تبدأ — بانتظار أمر البدء
```

**الأوامر للتحقق:**
```bash
# لكل حزمة/تطبيق
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"
# للمشروع ككل بعد الإصلاحات
npm install
npm run build
```

---

#### Workstream 1.2 — إصلاح Security & Config (F6, F7, F1.5)

| # | المهمة | الملفات | النوع |
|---|-------|---------|------|
| 1.2.1 | إضافة `.env` لـ `.gitignore` | `.gitignore` | edit |
| 1.2.2 | إضافة تحذير أمني في `.env.example` | `.env.example` | edit |
| 1.2.3 | تصحيح `CODEOWNERS` | `CODEOWNERS` | edit |
| 1.2.4 | إصلاح `packages/config/vite/index.js` (إعادة تسمية/نقل) | متعدد | move/rename |
| 1.2.5 | تحويل `latest` إلى إصدارات ثابتة في root `package.json` | `package.json` | edit |
| 1.2.6 | إضافة `tsconfig.json` لـ `packages/ui` | `packages/ui/tsconfig.json` | write |
| 1.2.7 | إضافة `composite: true` لـ `tsconfig.json` في 3 حزم | 3 ملفات tsconfig | edit |

**Sub-Agent Prompt (1.2):**
```
أنت مهندس إصلاح Config & Security. هدفك:
1. أضف .env لـ .gitignore مع تعليق توضيحي
2. عدل .env.example بإضافة تحذير عن SERVICE_ROLE_KEY
3. صحح CODEOWNERS (احذف @svu-community/core أو استبدله بـ @svu-community/devs)
4. عالج packages/config/vite/index.js (إما إعادة تسمية إلى vitest.config.js أو إنشاء vite.config.js جديد)
5. حدّث إصدارات root package.json من "latest" إلى إصدارات محددة
6. أنشئ tsconfig.json لـ packages/ui
7. أضف composite: true لحزم tsconfig الأربع
لا تبدأ — بانتظار أمر البدء
```

---

#### Workstream 1.3 — إصلاح تطبيقات (F1.1-F1.11 continuation)

| # | المهمة | الملفات |
|---|-------|---------|
| 1.3.1 | إضافة `dependencies` كاملة لـ `apps/admin` | `apps/admin/package.json` |
| 1.3.2 | إضافة `dependencies` كاملة لـ `apps/courses` | `apps/courses/package.json` |
| 1.3.3 | إضافة `dependencies` كاملة لـ `apps/schedule` | `apps/schedule/package.json` |
| 1.3.4 | إضافة `dependencies` كاملة لـ `apps/web` | `apps/web/package.json` |

**المعيار المشترك لكل تطبيق:**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

#### Checklist تأكيد المرحلة 1

```
[ ] 1.1.1 - 1.1.10: جميع package.json مصححة
[ ] 1.2.1 - 1.2.7: Security & Config مصححة
[ ] 1.3.1 - 1.3.4: جميع التطبيقات لها dependencies
[ ] npm install يعمل بدون أخطاء
[ ] npm run build يعمل لكل تطبيق
[ ] tsc --noEmit بدون أخطاء
[ ] .gitignore يحتوي .env
```

---

## ✅ المرحلة 2: تأكيد الإصلاحات (Verification)

> **مرتبط:** § 1.4 في الخطة  
> **المتتالية:** تعتمد على إكمال المرحلة 1 فقط  
> **المدة:** ½-1 يوم

### PHASE LEAD: phase-2-verifier

```yaml
role: Phase Lead
phase: 2
title: تأكيد الإصلاحات وفحص الأخطاء المخفية
priority: P0
depends_on: [Phase 1 complete]
blocks: [Phase 3, 4, 5]
deliverable: تقرير فحص شامل بدون أخطاء
```

#### Workstream 2.1 — فحص البناء (Build Verification)

| # | الاختبار | الأمر | المعيار |
|---|---------|-------|---------|
| 2.1.1 | npm install | `npm install` | ✅ نجاح بدون أخطاء |
| 2.1.2 | Build all apps | `npx turbo run build` | ✅ 0 أخطاء |
| 2.1.3 | Build per app | `npm run build` لكل app | ✅ نجاح كل تطبيق |
| 2.1.4 | TypeScript | `npx tsc --noEmit` | ✅ 0 أخطاء |
| 2.1.5 | Dev server | `npm run dev` | ✅ تشغيل بدون أخطاء |
| 2.1.6 | ESLint | `npm run lint` | ✅ 0 أخطاء |

#### Workstream 2.2 — فحص التبعيات والبنية

| # | الاختبار | الأداة | المعيار |
|---|---------|-------|---------|
| 2.2.1 | Imports Resolution | Manual + `tsc --noEmit` | ✅ كل imports محلولة |
| 2.2.2 | Circular Dependencies | `npx madge --circular src/` | ✅ 0 دورات |
| 2.2.3 | Unused Exports | `npx ts-prune` | ✅ 0 exports غير مستخدمة |
| 2.2.4 | Turbo Pipeline | Manual review | ✅ كل pipeline صحيح |
| 2.2.5 | Workspace integrity | `npm workspaces list` | ✅ كل 9 مساحات صالحة |

**Sub-Agent Prompt (2.1, 2.2):**
```
أنت مهندس فحص جودة. هدفك:
1. شغل كل أمر في checklist أعلاه
2. سجّل النتيجة لكل اختبار
3. إن واجهت خطأ:
   a. صنّفه (fatal/warning/info)
   b. حدد الملف والمسار
   c. اقترح إصلاح
4. أنتج تقرير Markdown بصيغة:
## Phase 2 Verification Report
### 2.X [اسم الاختبار]
- Status: PASS/FAIL/WARN
- Output: [...]
- Errors: [...]
- Fix needed: [yes/no]
لا تبدأ — بانتظار أمر البدء
```

---

## 📦 المرحلة 3: نقل الملفات الجاهزة (Porting)

> **مرتبط:** § 1.7 و § 1.3.3 في الخطة  
> **المتتالية:** بعد Phase 2  
> **المدة:** 2-4 أيام  
> **ملاحظة:** هذه المرحلة **يدوية** في معظمها — sub-agents للمراقبة فقط

### PHASE LEAD: phase-3-porter

```yaml
role: Phase Lead
phase: 3
title: نقل واعتماد الملفات الجاهزة
priority: P1
depends_on: [Phase 2 complete]
blocks: [Phase 4, 6]
deliverable: قائمة ملفات منقولة + تقرير فحص لكل ملف
```

### Workstream 3.1 — نقل مكونات Courses (الأولوية القصوى)

| # | المصدر | الهدف | Action |
|---|-------|-------|--------|
| 3.1.1 | `apps/courses/src/components/interactive-map/*` | نفس المسار | copy (موجود فعلاً) |
| 3.1.2 | `apps/courses/src/components/course-modal/*` | نفس المسار | copy (موجود فعلاً) |
| 3.1.3 | `apps/courses/src/features/courses/api/courses.ts` | `packages/types/src/courses.ts` | extract types |
| 3.1.4 | `apps/courses/src/features/courses/api/courses.ts` | موحّد مع interactive-map | refactor + dedup |
| 3.1.5 | Auth components | `apps/courses/src/features/auth/` | copy + verify |
| 3.1.6 | Shared components | `apps/courses/src/shared/components/` | move |

**Sub-Agent Prompt (3.1):**
```
أنت مهندس نقل ملفات. لكل مهمة في workload 3.1:
1. اقرأ الملف المصدر
2. افحص Syntax و Imports
3. انشئ نسخة في الهدف مع:
   - تصحيح المسارات (path aliases)
   - إضافة security check (لا أسرار hardcoded)
   - توحيد naming conventions
4. شغّل tsc --noEmit على الملف المنقول
5. سجل النتيجة
لا تبدأ — بانتظار أمر البدء
```

### Workstream 3.2 — نقل مكونات Admin & Schedule

| # | المصدر | الهدف |
|---|-------|-------|
| 3.2.1 | admin UI components | `apps/admin/src/features/` |
| 3.2.2 | admin API mock | `apps/admin/src/api/` |
| 3.2.3 | schedule Calendar component | `apps/schedule/src/features/calendar/` |
| 3.2.4 | schedule Grid component | `apps/schedule/src/features/grid/` |
| 3.2.5 | schedule shared components | `apps/schedule/src/shared/` |

### Workstream 3.3 — نقل الأدوات المشتركة

| # | المصدر | الهدف |
|---|-------|-------|
| 3.3.1 | hooks (useTheme, useAuth) | `packages/ui/src/hooks/` |
| 3.3.2 | utilities (helpers, formatters) | `packages/utils/src/` |
| 3.3.3 | TS types | `packages/types/src/` |
| 3.3.4 | supabase-client refinement | `packages/supabase-client/src/` |

#### Checklist تأكيد المرحلة 3

```
[ ] 3.1.1-3.1.6: مكونات courses منقولة ومصححة
[ ] 3.2.1-3.2.5: مكونات admin/schedule منقولة
[ ] 3.3.1-3.3.4: أدوات مشتركة منقولة
[ ] كل ملف منقول: Syntax OK, Imports OK, Security OK
[ ] يتم توحيد المنطق المكرر (courses.ts ↔ interactive-map)
[ ] npm run build يعمل لكل تطبيق
```

---

## 🔍 المرحلة 4: تحديد الملفات المفقودة (Gap Analysis)

> **مرتبط:** § 1.3.x في الخطة  
> **المتتالية:** متوازي مع Phase 3  
> **المدة:** ½ يوم

### PHASE LEAD: phase-4-analyzer

```yaml
role: Phase Lead
phase: 4
title: تحديد كامل للملفات المفقودة
priority: P1
depends_on: [Phase 2 complete]
runs_parallel_with: [Phase 3]
deliverable: تقرير شامل + خريطة تبعيات لكل ملف مفقود
```

| # | الفئة | الملفات المفقودة | الأولوية |
|---|-------|-------------------|---------|
| 4.1 | `packages/config` | tsconfig/base.json, tsconfig/node.json, tsconfig/react.json, eslint/index.js | 🔴 عالي |
| 4.2 | `packages/supabase-client` | src/server.ts, src/middleware.ts, src/index.ts | 🔴 عالي |
| 4.4 | `packages/types` | كل أنواع TS (course, group, user, index) | 🔴 عالي |
| 4.7 | `packages/ui` | styles/globals.css, utils/helpers.ts, index.ts | 🟡 متوسط |
| 4.8 | `supabase/config.toml` | إعداد المشروع | 🔴 عالي |
| 4.9 | `supabase/migrations/` | 7 ملفات SQL كاملة | 🔴 عالي |
| 4.10 | `supabase/seed/` | 3 ملفات seed | 🟡 متوسط |
| 4.11 | `supabase/functions/` | 3 دوال Edge | 🔴 عالي |
| 4.12 | `.github/workflows/` | 4 ملفات CI/CD | 🔴 عالي |
| 4.13 | `docs/` | 10 ملفات توثيق | 🟡 متوسط |
| 4.14 | `apps/admin` | 6 ملفات تنفيذية | 🔴 عالي |
| 4.15 | `apps/schedule` | 10 ملفات تنفيذية | 🔴 عالي |

**Sub-Agent Prompt (4):**
```
أنت محلل فجوات. هدفك:
1. قارن بنية المشروع الجديد مع ما في `docs/implementation-plan.md` §1.3
2. لكل فئة أدرج:
   - ملفات موجودة ← ✅
   - ملفات مفقودة ← ❌
   - ملفات فارغة (0 bytes) ← ⚠️
3. لكل ملف مفقود حدد:
   - الأولوية (P0/P1/P2)
   - التبعيات (ماذا يحتاج قبل بنائه)
   - تقدير小时的 العمل
4. أنتج:
   ## Gap Analysis Report
   ### 4.X [فئة]
   | Existing | Missing | Empty | Priority |
لا تبدأ — بانتظار أمر البدء
```

---

## 🔧 المرحلة 5: فحص كامل للمشروع (Full Audit)

> **مرتبط:** § 1.3.x و § 1.6 في الخطة  
> **المتتالية:** بعد Phase 2 (يمكن أن يعمل بالتوازي مع 3 و 4 بعد Phases 1-2)  
> **المدة:** 1 يوم

### PHASE LEAD: phase-5-auditor

```yaml
role: Phase Lead
phase: 5
title: فحص شامل كامل بدون تعديل
priority: P1
depends_on: [Phase 2 complete]
runs_parallel_with: [Phase 3, 4]
deliverable: Audit Report كامل مع قائمة المشاكل وخطط الإصلاح
```

#### Workstream 5.1 — فحص الكود

| # | الفئة | المدخلات | الأداة |
|---|-------|---------|------|
| 5.1.1 | Syntax | كل `.ts, .tsx, .js` | `tsc --noEmit` |
| 5.1.2 | Imports/Exports | كل ملفات `src/` | `tsc --noEmit`, madge |
| 5.1.3 | Path aliases | `tsconfig.json` × 4 | Manual check |
| 5.1.4 | Vite/ESLint configs | 4 تطبيقات + 5 حزم | Manual review |
| 5.1.5 | package.json | 9 ملفات | Manual review |
| 5.1.6 | Dead code | كل المشروع | `ts-prune` |

#### Workstream 5.2 — فحص الأمان

| # | الفئة | المدخلات |
|---|-------|---------|
| 5.2.1 | Secrets | كامل المشروع — بحث عن `AKIA`, `-----BEGIN`, `api_key`, `token` |
| 5.2.2 | `.env.example` مقابل الكود | كل خدمات Supabase |
| 5.2.3 | RLS readiness | `supabase/migrations/` |
| 5.2.4 | Supabase functions | أي validation أو rate limiting |

#### Workstream 5.3 — فحص الجودة

| # | الفئة |
|---|-------|
| 5.3.1 | Code duplication (DRY) |
| 5.3.2 | Complexity (دوال > 20 سطر) |
| 5.3.3 | Error handling coverage |
| 5.3.4 | Arabic compatibility (fonts, direction) |
| 5.3.5 | Circular dependencies |

**Sub-Agent Prompt (5.1-5.3):**
```
أنت مدقق جودة. هدفك: فحص كامل بدون تعديل.
لكل فئة في checklist أعلاه:
1. شغّل الأداة المحددة
2. سجّل النتيجة (PASS/FAIL/WARN)
3. لكل FAIL: حدد الملف، السطر، نوع المشكلة، اقتراح الإصلاح
أنتج تقرير:
## Audit Report Phase 5
### 5.X [الفئة]
- Items checked: N
- PASS: N | FAIL: N | WARN: N
- Critical: list
لا تبدأ — بانتظار أمر البدء
```

---

## 🔧 المرحلة 6: إصلاح المشاكل المكتشفة (Fix Issues)

> **مرتبط:** § 1.6 في الخطة  
**المتتالية:** بعد Phase 5  
**المدة:** 2-4 أيام

### PHASE LEAD: phase-6-fixer

```yaml
role: Phase Lead
phase: 6
title: إصلاح جميع المشاكل من Phase 5
priority: P1
depends_on: [Phase 5 complete]
blocks: [Phase 7]
deliverable: 0 أخطاء fatal، 0 أخطاء TypeScript، 0 circular dependencies
```

#### Workstream 6.1 — إصلاح الأخطاء (Errors)

| # | الفئة | الإجراء |
|---|-------|---------|
| 6.1.1 | TypeScript errors | لكل error: fix type, add type guard, أو disable مع تعليق |
| 6.1.2 | Import errors | تصحيح المسارات، إضافة exports مفقودة |
| 6.1.3 | Config errors | إكمال tsconfig, eslint, tailwind configs |

#### Workstream 6.2 — إصلاح الأمان (Security)

| # | المشكلة | الإصلاح |
|---|---------|---------|
| 6.2.1 | Client-side service_role | إضافة middleware للـ server calls فقط |
| 6.2.2 | RLS missing | كتابة RLS policies لكل جدول |
| 6.2.3 | Functions validation | إضافة token validation + rate limiting |
| 6.2.4 | Supabase client SSR crash | إصلاح client.ts ليتعامل مع SSR |

#### Workstream 6.3 — تحسين الجودة

| # | الفئة | الإجراء |
|---|-------|---------|
| 6.3.1 | Duplicate logic | توحيد `courses.ts` مع `interactive-map/utils` |
| 6.3.2 | Dead code | حذف exports غير مستخدمة |
| 6.3.3 | Complexity | تقسيم الدوال الكبيرة |
| 6.3.4 | Naming | توحيد conventions |

**Sub-Agent Prompt (6.1-6.3):**
```
أنت مهندس إصلاح. لديك تقرير Phase 5 Audit.
لكل خطأ في التقرير:
1. اقرأ الملف المصاب
2. طبّق الإصلاح المقترح
3. تحقق بعد التعديل:
   - tsc --noEmit
   - npm run lint
4. سجّل: Fixed/Not Fixed/Needs Manual Review
5. إن كان الإصلاح يحتاج قرار → ارفعه للـ Phase Lead
لا تبدأ — بانتظار أمر البدء
```

#### Checklist تأكيد المرحلة 6

```
[ ] 6.1.1-6.1.3: أخطاء TypeScript/Import/Config: 0
[ ] 6.2.1-6.2.4: أخطاء الأمان: 0 حرجة/عالية
[ ] 6.3.1-6.3.4: تحسين الجودة مكتمل
[ ] npm run build: 0 errors
[ ] npm run lint: 0 errors
[ ] tsc --noEmit: 0 errors
[ ] madge --circular: 0 دورات
```

---

## 🧪 المرحلة 7: الاختبارات والفحوصات (Testing & QA)

> **مرتبط:** § 1.7 و § 1.6 في الخطة  
> **المتتالية:** بعد Phase 6 (يمكن أن يبدأ بالتوازي مع 5 و 6 لاختبارات الوحدات)  
> **المدة:** 2-3 أيام

### PHASE LEAD: phase-7-tester

```yaml
role: Phase Lead
phase: 7
title: الاختبارات والفحوصات الشاملة
priority: P1
depends_on: [Phase 6 complete]
runs_parallel_with: [Phase 5 Unit Tests, Phase 6 Integration]
deliverable: تقارير: Test Report + Performance Report + Security Report
```

#### Workstream 7.1 — اختبارات الجودة (Code Quality)

| # | الاختبار | الأداة | المعيار |
|---|---------|-------|---------|
| 7.1.1 | Linting | ESLint | 0 أخطاء |
| 7.1.2 | Type Checking | `tsc --noEmit` | 0 أخطاء |
| 7.1.3 | Formatting | Prettier | كود موحد |
| 7.1.4 | Complexity | ESLint complexity | دوال ≤ 20 سطر |
| 7.1.5 | Dead Code | `ts-prune` | 0 كود ميت |

#### Workstream 7.2 — اختبارات البناء (Build Tests)

| # | الاختبار | الأمر | المعيار |
|---|---------|-------|---------|
| 7.2.1 | Build all apps | `turbo run build` | 0 أخطاء |
| 7.2.2 | Build per app | `npm run build` | ✅ كل تطبيق |
| 7.2.3 | Dev server | `npm run dev` | ✅ تشغيل بدون أخطاء |
| 7.2.4 | Preview | `npm run preview` | ✅ serve يعمل |
| 7.2.5 | Type checking | `tsc -b` | 0 أخطاء |
| 7.2.6 | Bundle size | rollup-plugin-visualizer | ≤ 300KB/app |

**Sub-Agent Prompt (7.1, 7.2):**
```
أنت مهندس اختبارات. goal: تشغيل كل اختبار في checklist 7.1 و 7.2.
لكل اختبار:
1. شغّل الأمر
2. سجّل النتيجة
3. إن فشل: صنّف الخطأ واقترح الإصلاح
أنتج تقرير:
## Test Report Phase 7
### 7.X [اسم الاختبار]
- Command: [...]
- Status: PASS/FAIL
- Output:
- Errors (إن وجدت):
لا تبدأ — بانتظار أمر البدء
```

#### Workstream 7.3 — اختبارات الأداء (Load Tests)

| # | الاختبار | الأداة | المعيار |
|---|---------|-------|---------|
| 7.3.1 | API Load Test | k6 | 1000 RPS × 5min |
| 7.3.2 | Stress Test | k6 | تحديد breaking point |
| 7.3.3 | Spike Test | k6 | محاكاة طفرات |
| 7.3.4 | Endurance Test | k6 | 30 دقيقة متواصلة |
| 7.3.5 | Frontend Performance | Lighthouse | Score ≥ 90 |
| 7.3.6 | Bundle Analysis | rollup-plugin-visualizer | تحليل الحجم |

#### Workstream 7.4 — اختبارات الأمان (Security)

| # | الاختبار | الأداة | المعيار |
|---|---------|-------|---------|
| 7.4.1 | Dependency Audit | `npm audit` | 0 critical/high |
| 7.4.2 | Secret Scanning | `truffleHog` / `gitleaks` | 0 أسرار مكشوفة |
| 7.4.3 | RLS Verification | Manual SQL | كل الجداول لها RLS |
| 7.4.4 | CSP Headers | Manual review | headers صحيحة |
| 7.4.5 | CORS Check | Manual review | origins محددة |

#### Checklist المرحلة 7

```
[ ] 7.1.1-7.1.5: Code Quality tests: all PASS
[ ] 7.2.1-7.2.6: Build tests: all PASS
[ ] 7.3.1-7.3.6: Performance tests: all PASS
[ ] 7.4.1-7.4.5: Security tests: all PASS
[ ] تقرير شامل مُنتج
[ ] لا توجد أخطاء حرجة/عالية المتبقية
```

---

## 📚 المرحلة 8: التوثيق الكامل (Documentation)

> **مرتبط:** § 8.1-8.5 في الخطة  
> **المتتالية:** يمكن أن تبدأ بالتوازي مع Phase 7  
> **المدة:** 1-2 يوم

### PHASE LEAD: phase-8-documenter

```yaml
role: Phase Lead
phase: 8
title: توثيق كامل مع مخططات
priority: P2
depends_on: [Phase 1 complete, Phase 6 complete]
runs_parallel_with: [Phase 7]
deliverable: 8+ ملفات توثيق + 5+ مخططات Mermaid
```

#### Workstream 8.1 — توثيق العمارة

| # | الوثيقة | المحتوى |
|---|---------|---------|
| 8.1.1 | `docs/architecture/overview.md` | نظرة عامة على العمارة + المخطط |
| 8.1.2 | `docs/architecture/monorepo.md` | شرح Monorepo structure + diagram |
| 8.1.3 | `docs/architecture/database.md` | مخطط قاعدة البيانات + ER Diagram |
| 8.1.4 | `docs/api/gemini-proxy.md` | وثيقة Edge Function |
| 8.1.5 | `docs/api/ocr-proxy.md` | وثيقة Edge Function |
| 8.1.6 | `docs/api/send-email.md` | وثيقة Edge Function |

#### Workstream 8.2 — توثيق التطوير

| # | الوثيقة | المحتوى |
|---|---------|---------|
| 8.2.1 | `docs/guides/setup.md` | دليل إعداد محلي خطوة بخطوة |
| 8.2.2 | `docs/guides/contributing.md` | دليل المساهمة |
| 8.2.3 | `docs/guides/deployment.md` | دليل نشر لكل تطبيق |
| 8.2.4 | `README.md` | نظرة عامة + أوامر سريعة + architecture diagram |

#### Workstream 8.3 — مخططات Mermaid

| # | المخطط | المكان |
|---|--------|--------|
| 8.3.1 | System architecture (مشترك) | `docs/architecture/overview.md` |
| 8.3.2 | Monorepo structure | `docs/architecture/monorepo.md` |
| 8.3.3 | ER Database | `docs/architecture/database.md` |
| 8.3.4 | Phase workflow | `docs/implementation-plan.md` (تحديث) |
| 8.3.5 | CI/CD pipeline | `docs/guides/deployment.md` |

#### Checklist المرحلة 8

```
[ ] 8.1.1-8.1.6: 6 ملفات توثيق عمارة و API
[ ] 8.2.1-8.2.4: 4 ملفات توثيق تطوير
[ ] 8.3.1-8.3.5: 5 مخططات Mermaid
[ ] كل ملف يحتوي: عنوان، مخطط، شرح
[ ] العربية والإنجليزية متوازنة
[ ] README.md محدث بالكامل
```

---

## 🗺️ خريطة التبعيات بين المراحل (Dependency Map)

```
Phase 0 ─────────────────────────────────────────────────────────┐
  │ P0 (إلزامي)                                                  │
  ▼                                                              │
Phase 1 ──► Phase 2 ──┬──► Phase 3 ──► Phase 6 ──► Phase 7 ─┐  │
  │ P0 (إلزامي)       │         │ P1        │ P1          │ P1  │  │
  ▼                   │         ▼          ▼             ▼    │  │
                      │    Phase 4   Phase 5              │    │  │
                      │    P1        P1 (توازي)          │    │  │
                      │    (توازي مع 3)                  │    │  │
                      │         │          │              │    │  │
                      └─────────┼──────────┼──────────────┘    │  │
                                │          │                   │  │
                            Phase 8 ◄──────────────────────────┘  │
                            P2 (توازي مع 7)                       │
                                                                  │
                    ┌─────────────────────────────────────────────┘
                    │
               [نهاية المشروع]
```

```
Legend:
  ──► : يسلسل (يعتمد على)
  ──┬ : يوازي (يمكن أن يعمل بنفس الوقت)
  P0 : أولوية قصوى (إلزامي)
  P1 : أولوية عالية
  P2 : أولوية متوسطة
```

---

## 📋 قائمة أوامر المراقبة (Monitoring Commands)

### لكل Phase Lead
```bash
# فحص حالة المهام
todowrite --list

# تشغيل meta-check
npx turbo run build lint typecheck

# فحص الأخطاء
grep -r "FATAL\|ERROR\|critical" docs/report.md || echo "No critical errors"
```

### لكل Execution Sub-Agent
```bash
# بعد كل مهمة
tsc --noEmit && echo "✅ TS OK" || echo "❌ TS FAIL"
eslint src/ && echo "✅ Lint OK" || echo "❌ Lint FAIL"
```

---

## 🔁 دورة المراجعة (Review Cycle)

```
1. Phase Lead يراجع deliverables عند اكتمال كل Workstream
2. Phase Lead يرفع تقرير إلى الـ Phase Lead الأعلى
3. عند اكتمال Phase: تشغيل checklist التأكيد
4. قبل الانتقال للـ Phase التالي: Phase Lead يحصل على موافقة
5. عند اكتشاف مشكلة خطيرة: تصعيد فوري للتاسك الأصلي
```

---

## 📊 رسم تتبع التقدم (Progress Tracker)

| المرحلة | الحالة | نسبة الإنجاز | المعوقات |
|---------|--------|-------------|---------|
| Phase 0 | ⏳ قيد الإعداد | 0% | — |
| Phase 1 | ⏸ من.waiting | 0% | Phase 0 |
| Phase 2 | ⏸ من.waiting | 0% | Phase 1 |
| Phase 3 | ⏸ من.waiting | 0% | Phase 2 |
| Phase 4 | ⏸ من.waiting | 0% | Phase 2 (توازي) |
| Phase 5 | ⏸ من.waiting | 0% | Phase 2 (توازي) |
| Phase 6 | ⏸ من.waiting | 0% | Phase 5 |
| Phase 7 | ⏸ من.waiting | 0% | Phase 6 |
| Phase 8 | ⏸ من.waiting | 0% | Phase 1 + 6 (توازي) |

---

## 📌 ملاحظات تشغيل الـ Workflow

1. **الـ Phase Leads يُعينون تلقائياً** عند بدء كل مرحلة
2. **كل Sub-Agent يحصل على Task ID** فريد لتتبع النتائج
3. **التصعيد يتم عبر `docs/task-reports/`** — كل تقرير منسق
4. **المراحل المتوازية تعمل على فروع git منفصلة** (يتطلب git setup)
5. **بعد كل Phase:** تحديث هذه الوثيقة بنسبة الإنجاز الفعلية
6. **لا يُسمح بتجاوز Phase 1** بدون Phase Lead موافق خطياً

---

> **آخر تحديث:** 2026-06-11  
> **الإصدار:** 1.0  
> **الحالة:** 🚧 جاري التفعيل  
> **للاستخدام مع:** `docs/implementation-plan.md`
