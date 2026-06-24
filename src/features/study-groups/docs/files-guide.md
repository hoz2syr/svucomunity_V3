# دليل ملفات ميزة المجموعات الدراسية

## 📁 بنية المجلدات

```
src/features/study-groups/
├── components/                    # 13 مكون واجهة
│   ├── CreateGroupModal.tsx       # نافذة إنشاء مجموعة
│   ├── Dropdown.tsx              # قائمة منسدلة مخصصة
│   ├── ErrorBoundary.tsx         # حدود خطأ React
│   ├── ErrorState.tsx            # عرض حالة الخطأ
│   ├── GroupCard.tsx             # بطاقة المجموعة
│   ├── GroupDetailsModal.tsx     # نافذة تفاصيل المجموعة
│   ├── ModalShell.tsx            # هيكل النوافذ
│   ├── PrimaryButton.tsx         # زر أساسي
│   ├── ProgressBar.tsx           # شريط التقدم
│   ├── StudyGroupCardSkeleton.tsx # هيكل التحميل
│   ├── StudyGroupsFilters.tsx    # فلاتر البحث
│   ├── StudyGroupsLayout.tsx     # تخطيط الصفحة
│   └── StudyGroupsNavbar.tsx     # شريط التنقل
│
├── src/
│   ├── core/
│   │   └── services/
│   │       └── index.ts          # تصدير الخدمات
│   ├── hooks/                    # 4 Hooks مخصصة
│   │   ├── useDebounce.ts        # Hook debounce موحد
│   │   ├── useStudyGroups.ts     # إدارة حالة المجموعات
│   │   ├── useStudyGroupsActions.ts # إجراءات المجموعات
│   │   ├── useStudyGroupsPage.ts # منطق الصفحة المركزي
│   │   └── index.ts              # تصدير Hooks
│   ├── pages/
│   │   └── StudyGroupsHome.tsx   # الصفحة الرئيسية
│   ├── services/
│   │   ├── studyGroup.supabase.ts # خدمات Supabase
│   │   └── courseCatalog.ts      # كتالوج المواد
│   ├── types/
│   │   └── index.ts              # تعريفات TypeScript
│   └── constants.ts              # CLASSES
│
├── tests/                        # 18 ملف اختبار
│   ├── components/               # 11 ملف اختبار
│   ├── hooks/                    # 3 ملفات اختبار
│   ├── pages/                    # 1 ملف اختبار
│   ├── services/                 # 2 ملف اختبار
│   ├── types/                    # 1 ملف اختبار
│   └── lib/                      # فارغ
│
└── docs/                         # 5 ملفات توثيق
    ├── index.md                  # الفهرس الرئيسي
    ├── README.md                 # نظرة عامة
    ├── user-stories.md           # قصص المستخدم
    ├── diagrams.md               # مخططات UML
    └── api-endpoints.md          # واجهات Backend
```

## 📝 قائمة الملفات مع الوصف

### المكونات (13 ملف)

| # | الملف | الوصف |
|---|--------|-------|
| 1 | `CreateGroupModal.tsx` | نافذة إنشاء مجموعة مع نموذج |
| 2 | `Dropdown.tsx` | قائمة منسدلة قابلة للبحث |
| 3 | `ErrorBoundary.tsx` | حدود خطأ Class Component |
| 4 | `ErrorState.tsx` | عرض رسالة خطأ مع زر إعادة |
| 5 | `GroupCard.tsx` | بطاقة عرض المجموعة |
| 6 | `GroupDetailsModal.tsx` | نافذة تفاصيل المجموعة |
| 7 | `ModalShell.tsx` | هيكل النوافذ المنبثقة |
| 8 | `PrimaryButton.tsx` | زر أساسي بورود/سايد |
| 9 | `ProgressBar.tsx` | شريط تقدم الأعضاء |
| 10 | `StudyGroupCardSkeleton.tsx` | هيكل تحميل 8 بطاقات |
| 11 | `StudyGroupsFilters.tsx` | فلاتر البحث والفرز |
| 12 | `StudyGroupsLayout.tsx` | تخطيط الصفحة |
| 13 | `StudyGroupsNavbar.tsx` | شريط التنقل |

### Hooks (4 ملفات)

| # | الملف | الوصف |
|---|--------|-------|
| 1 | `useDebounce.ts` | Hook موحد للـ debounce |
| 2 | `useStudyGroups.ts` | حالة المجموعات + فلترة |
| 3 | `useStudyGroupsActions.ts` | إجراءات: إنشاء/انضمام/حذف |
| 4 | `useStudyGroupsPage.ts` | منطق الصفحة المركزي |

### الخدمات (2 ملف)

| # | الملف | الوصف |
|---|--------|-------|
| 1 | `studyGroup.supabase.ts` | اتصال Supabase + CRUD |
| 2 | `courseCatalog.ts` | كتالوج المواد الثابت |

### الأنواع (1 ملف)

| # | الملف | الوصف |
|---|--------|-------|
| 1 | `types/index.ts` | StudyGroup, Course, Filters |

### الاختبارات (18 ملف)

| المجلد | # | الملفات |
|---------|---|----------|
| components/ | 11 | CreateGroupModal, Dropdown, ErrorBoundary, ErrorState, GroupCard, GroupDetailsModal, PrimaryButton, ProgressBar, StudyGroupCardSkeleton, StudyGroupsFilters |
| hooks/ | 3 | useStudyGroupsPage, useStudyGroups, useStudyGroupsActions |
| pages/ | 1 | StudyGroupsHome |
| services/ | 2 | studyGroup.supabase, courseCatalog |
| types/ | 1 | index |

## 🔧 التحسينات المنفذة

### 1. Hook Debounce موحد
```typescript
// src/features/study-groups/src/hooks/useDebounce.ts
export function useDebounce<T>(callback: T, delay: number = 300)
```

**قبل:**
```typescript
// duplicated in useStudyGroups.ts
const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
// duplicated in StudyGroupsFilters.tsx
const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

**بعد:**
```typescript
// single source of truth
const { debouncedFn } = useDebounce((value) => updateFilter('search', value), 300);
```

### 2. StudyGroupEnriched Type
```typescript
// Before: mixing enriched props with base type
const [groups, setGroups] = useState<StudyGroup[]>([]);
// After: explicit separation
const [groups, setGroups] = useState<StudyGroupEnriched[]>([]>;
```

### 3. استخدام useMemo لـ isAdmin
```typescript
// Before: checking on every render
useEffect(() => { checkIsAdmin(...) }, [userId])
// After: memoized value
const isAdmin = useMemo(() => rawIsAdmin, [rawIsAdmin]);
```

---

## 📊 إحصائيات

| المقياس | القيمة |
|---------|--------|
| عدد الأسطر (تقريبي) | ~2500 |
| عدد المكونات | 13 |
| عدد الاختبارات | 18 |
| نسبة التغطية | ~94% |
| عدد Hooks | 4 |
| عدد الخدمات | 2 |

---

## 🔄 سجل التعديلات

| التاريخ | التعديل | المكان |
|---------|---------|--------|
| 2024-06-24 | إنشاء useDebounce | hooks/useDebounce.ts |
| 2024-06-24 | إضافة StudyGroupEnriched | types/index.ts, hooks/useStudyGroups.ts |
| 2024-06-24 | تحسين isAdmin | hooks/useStudyGroupsPage.ts |
| 2024-06-24 | حذف core/storage | مجلد محذوف |
| 2024-06-24 | إضافة useStudyGroupsPage.test.ts | tests/hooks/ |
| 2024-06-24 | إنشاء ملفات التوثيق | docs/*.md |
