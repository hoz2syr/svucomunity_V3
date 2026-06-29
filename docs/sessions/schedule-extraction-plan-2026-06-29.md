# Schedule Extraction — Implementation Plan

来源: `ite_comunety/js/page-schedule.js` + `ite_comunety/js/gemini-service.js` + `ite_comunety/js/shared.js`
تاريخ: 2026-06-29

---

## 1. ما تم استخلاصه من المشروع القديم

### 1.1 منطق المطابقة (`majorMatches`)
القديم فيه دالة مطابقة التخصصات بالكامل — تراعي الاختصارات والأسماء الكاملة:

```js
// ITE / Information Technology
if ((ext.includes('information technology') || ext.includes('ite')) &&
    (grp.includes('information technology') || grp.includes('ite'))) return true;
// Engineering
if (ext.includes('engineering') && grp.includes('engineering')) return true;
// Business (BA, BBA)
if ((ext.includes('business') || ext.includes('ba') || ext.includes('bba')) &&
    (grp.includes('business') || grp.includes('ba') || grp.includes('bba'))) return true;
// CS
if ((ext.includes('computer science') || ext.includes('cs')) &&
    (grp.includes('computer science') || grp.includes('cs'))) return true;
// ENG
if (ext.includes('eng') && grp.includes('eng')) return true;
// fallback: exact match
return ext === grp;
```

**الدرس:** لا تعتمد على مطابقة خاطئة — التطابق الشرطي أولًا، فالمطابقة التامة.

---

### 1.2 منطق الاستخراج من الصورة (`gemini-service.js`)

| الخطوة | الوصف |
|---|---|
| OCR API | `https://api.ocr.space/parse/image` — engine 2، لغة eng، كشف الاتجاه |
| تنظيف النص | إزالة `t_xxx` (أسماء مستخدمين)، `S25` (رمز فصل)، أرقام صفوف |
| استخراج الكود | regex: `(ITE\|ENG\|BA\|CS)_[A-Z]{2-5}\d{2-4}` |
| استخراج الشعبة | regex: `_C(\d+)_` → `C10` |
| اكتشاف الاسم | النص قبل الكود في نفس السطر، مع السطر السابق كاحتياط |
| اكتشاف الدكتور | النص بعد الكود في نفس السطر، مع السطر التالي كاحتياط |
| إزالة التكرار | يُتجاهل المقرر إذا كان الكود موجوداً مسبقاً (`seen[code]`) |

**رسائل الخطأ التفصيلية:**
- `OCR_API_KEY_NOT_CONFIGURED`
- `OCR_API_KEY_INVALID`
- `OCR_QUOTA_EXCEEDED`
- `OCR_NETWORK_ERROR`
- `OCR_PROCESSING_ERROR`
- `OCR_NO_TEXT`
- `INVALID_IMAGE_DATA`

---

### 1.3 منطق المطابقة مع المجموعات (`page-schedule.js`)

```
matched[code] = allGroups.filter(g =>
  g.course_code.toUpperCase() === code  ← تطابق كود المقرر
  && majorMatches(extractedMajor, g.major)  ← تطابق التخصص
)
```

**الترتيب:** لا يوجد ترتيب معقد — ناتج المطابقة هو `MatchedGroup[]` مرتب حسب `created_at DESC` (الأحدث أولاً).

**الدرس:** المطابقة الحالية ثنائية المرحلة (كود + تخصص). المطلوب في الإصدار الجديد:
- إضافة درجة مطابقة `matchScore`
- ترتيب تنازلي حسب الأفضلية

---

### 1.4 منطق الإنشاء التلقائي (Auto-Create)

عند عدم وجود تطابق:
1. يفتح Modal تلقائي
2. يُعبأ مسبقاً:
   - اسم المجموعة: `"مراجعة - {courseName}"`
   - رقم الشعبة: من `section` المستخرجة
   - التخصص: تخصص المستخدم الحالي
   - أقصى عدد أعضاء: 5
3. ينشئ المجموعة + يُدخل المنشئ كأول عضو (`group_members`)
4. يعيد تحميل البطاقات

**الفرق عن الإصدار الحالي:**
- القديم: ينشئ مباشرة في Supabase
- الجديد: يُنشئ **مسودة** (`DraftGroup`) ويطلب من المستخدم التأكيد

---

### 1.5 بيانات ثابتة مفيدة

من `shared.js`:

```js
// Major aliases — نستخدمها في majorMatches
ITE → Information Technology
ENG → Engineering  
BA / BBA → Business Administration
CS → Computer Science

// Courses catalog — موجود بالفعل كـ svu_courses.json
window.loadSVUCourses() // مع 캐시
window.getCoursesByMajor(majorKey)
window.resolveMajorKey(majorCode)
```

---

## 2. الحالة الحالية للمشروع الجديد

### ✅ موجود
- `DropZone` — رفع الصورة + معاينة
- `CreateGroupModal` — نموذج إنشاء مجموعة (بشكل كامل)
- `EditDraftModal` — نموذج تعديل مسودة
- `ExtractedGroupCard` — بطاقة مجموعة مطابقة
- `DraftGroupCard` — بطاقة مسودة
- `types/index.ts` — أنواع البيانات الأساسية
- `studyGroupsApi.ts` — `getAllWithCreators()`, `createGroup()`, `joinGroup()`
- `courseCatalog.ts` — `getCoursesByMajorStatic()`, `searchCourses()`
- `svu_courses.json` — كتالوج المقررات

### ❌ ناقص
- `services/ocrParser.ts` — OCR call + parsing
- `services/matchingService.ts` — منطق المطابقة
- `hooks/useScheduleMatching.ts` — hook يربط كل شيء
- Validation utilities
- Auto-draft creation logic
- `matchScore` في `MatchedGroup`
- `ExtractedGroupCard` لا يعرض درجة المطابقة
- `DraftGroupCard` لديه `DraftGroup` محلي مكرر

---

## 3. خطة التنفيذ

### المرحلة 1: OCR Service (`services/ocrParser.ts`)

```typescript
// src/features/schedule-extraction/services/ocrParser.ts

export interface OCRResult {
  rawText: string;
  major: string;
  courses: ExtractedCourse[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ─── OCR API ───
async function callOCR(base64DataUrl: string): Promise<string>

// ─── Helpers ───
function isNoise(line: string): boolean
function hasSVUCode(line: string): boolean
function extractCode(line: string): string | null
function extractSection(line: string): string | null
function looksLikeName(line: string): boolean
async function lookupCourseName(code: string, catalog: Record<string, Course[]>): Promise<string>

// ─── Parser ───
function parseScheduleText(rawText: string, catalog: Record<string, Course[]>): OCRResult

// ─── Public ───
export async function extractScheduleFromImage(
  base64Image: string,
  mimeType: string
): Promise<{ result: OCRResult; validation: ValidationResult }>
```

**أخطاء OCR** Matching القديم بالضبط.

---

### المرحلة 2: Matching Service (`services/matchingService.ts`)

```typescript
// src/features/schedule-extraction/services/matchingService.ts

export interface MatchResult {
  matched: MatchedGroup[];      // مصنفة حسب matchScore تنازلياً
  unmatched: ExtractedCourse[];  // بدون تطابق → مسودات تلقائية
}

export interface MatchScore {
  group: MatchedGroup;
  score: number;        // 0-100
  reasons: string[];    // "same-code+same-major", "same-major", "same-code"
}

// ─── Fuzzy major matching (من القديم) ───
function majorMatches(extracted: string, group: string): boolean

// ─── Score calculation ───
function calculateMatchScore(course: ExtractedCourse, group: MatchedGroup): MatchScore

// ─── Public ───
export function matchCoursesToGroups(
  extractedCourses: ExtractedCourse[],
  existingGroups: MatchedGroup[],
  extractedMajor: string
): MatchResult
```

**الترتيب:**
1. `same-code + same-major` → score 100
2. `same-code + different-major` → score 60 (لكن يُعرض مع تحذير)
3. `same-major + similar-code (fuzzy)` → score 40
4. `same-major only` → score 20

---

### المرحلة 3: Hook (`hooks/useScheduleMatching.ts`)

```typescript
// src/features/schedule-extraction/hooks/useScheduleMatching.ts

export function useScheduleMatching() {
  // 1. يبني catalog من svu_courses.json
  // 2. يطلب كل المجموعات عبر getAllWithCreators()
  // 3. عند استخراج صورة:
  //    - ocrParser.extractScheduleFromImage()
  //    - validation result
  //    - matchingService.matchCoursesToGroups()
  //    - unmatched → autoDrafts
  // 4. يرجع:
  //    { result, matchedGroups, autoDrafts, validation, isExtracting, error, extract }
}
```

---

### المرحلة 4: تعديل المكونات

| الملف | التعديل |
|---|---|
| `types/index.ts` | إضافة `matchScore?: number` و `validationErrors?: string[]` |
| `ExtractedGroupCard.tsx` | عرض score badge: "مطابق 100%" أو "تطابق جزئي" |
| `CourseCard.tsx` | فرز `matchedGroups` حسب `matchScore` تنازلياً |
| `ScheduleExtractionPage.tsx` | قبول `validationErrors` + عرض تحذيرات + autoDrafts |
| `DraftGroupCard.tsx` | حذف `DraftGroup` المحلي، استيراد من `types` |
| `EditDraftModal.tsx` | إضافة `whatsapp_link` (مفقود حالياً) |
| **جديد** `components/ValidationBanner.tsx` | يعرض أخطاء/تحذيرات الاستخراج |

---

## 4. هيكل الملفات النهائي

```
src/features/schedule-extraction/
├── services/
│   ├── ocrParser.ts          # NEW — OCR + parse
│   ├── matchingService.ts    # NEW — fuzzy match + scoring
│   └── index.ts              # barrel export
├── hooks/
│   └── useScheduleMatching.ts  # NEW — orchestrator
├── types/index.ts            # MODIFY — add matchScore
├── components/
│   ├── ExtractedGroupCard.tsx  # MODIFY — show score badge
│   ├── CourseCard.tsx          # MODIFY — sort by score
│   ├── DraftGroupCard.tsx      # MODIFY — use shared DraftGroup
│   ├── CreateGroupModal.tsx    # NO CHANGE
│   ├── EditDraftModal.tsx      # MODIFY — add whatsapp_link
│   ├── DropZone.tsx            # NO CHANGE
│   ├── GroupDetailsModal.tsx   # NO CHANGE
│   └── shared/
│       ├── ProgressBar.tsx
│       ├── ModalShell.tsx
│       └── ErrorState.tsx
├── pages/
│   └── ScheduleExtractionPage.tsx  # MODIFY — validation banner + auto-drafts
├── index.ts                  # MODIFY — new exports
└── components/
    ├── ScheduleExtractionLayout.tsx
    └── ScheduleNavbar.tsx
```

---

## 5. ملاحظات تقنية

### OCR.Space API Key
- مصرّح به في `vite.config.ts` CSP (`api.ocr.space`)
- المفتاح يُمرر من environment variables (`SVU_ENV.OCR_API_KEY`)
- يجب أن يُقرأ من Supabase Edge Function، لا من client مباشرة (أمن)

### Course Catalog
- `svu_courses.json` موجود في `public/`
- `courseCatalog.ts` لديه `getCoursesByMajorStatic()` مع caching
- `lookupCourseName()` يستخدم نفس المنطق

### Supabase Data Flow
```
.getAllWithCreators() → all StudyGroups
.matchCoursesToGroups() → { matched, unmatched }
unmatched.map(course) → DraftGroup[]
```

### Error Handling
نفس الأخطاء التفصيلية من القديم + أخطاء validation محلية.
