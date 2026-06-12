# i18n Audit Report — Arabic/English & RTL Support

**Date:** 2026-06-12  
**Scope:** apps/web/src/js/i18n/, apps/admin/src/, apps/courses/src/, apps/schedule/src/, packages/ui/src/

---

## Critical Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 1 | `apps/courses/src/App.tsx` | 39 | **Entire courses app has no language switcher** — all strings hardcoded in Arabic, no translation file integration | i18n module not imported; React SPA built outside `apps/web` i18n system | Create React i18n context/provider, add language toggle, migrate strings to translation keys |
| 2 | `apps/schedule/src/App.tsx` | 1-162 | **Schedule app is 100% English** — no i18n import, no dir/lang switching | Built independently; no i18n system integrated | Integrate React i18n solution, add AR translations, add `dir`/`lang` switching |
| 3 | `apps/admin/src/App.tsx` | 1-71 | **Admin app is 100% Arabic** — no English support, no translation system | Same as #1 — no i18n layer | Add i18n lay ER and EN translations |
| 4 | `apps/schedule/src/components/AppTabs.tsx` | 27, 42 | `"Upload Schedule"` and `"Matching Groups"` hardcoded English | No schedule translation file | Move to `t('scheduleUploadTab')` / `t('scheduleMatchedGroupsTab')` |
| 5 | `apps/schedule/src/components/LandingPage.tsx` | 1-45 | Entire landing page is English — title, subtitle, feature cards all hardcoded | No i18n | All 10+ strings need translation keys |

## High Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 6 | `apps/schedule/src/components/ResultsTab.tsx` | multiple | 40+ English strings hardcoded ("Extracted Courses", "Major:", "Section", "Instructor", "Available Groups", "Loading...", "Load More", "No groups found", etc.) | No schedule translation system | Add to schedule translation dictionary |
| 7 | `apps/schedule/src/components/UploadTab.tsx` | multiple | "Processing your schedule...", "Upload your schedule image", "Drag and drop..." all hardcoded English | No i18n | Add to translation file |
| 8 | `apps/schedule/src/App.tsx` | 50 | `'Failed to sign in with Google.'` hardcoded English auth error | No translation in schedule auth handler | `setError(t('authGoogleError'))` |
| 9 | `apps/admin/src/shared/components/Sidebar.tsx` | 9-12 | Nav labels `"لوحة التحكم"`, `"المستخدمون"`, `"المقررات"`, `"الإعدادات"` hardcoded Arabic | No admin translation file | Move to admin i18n dictionary |
| 10 | `apps/web/src/js/modules/utils/helpers.js` | 2 | `toLocaleDateString('en-US')` hardcoded — never respects Arabic | Legacy helper hardcoded at creation time | `toLocaleDateString(getLang() === 'ar' ? 'ar-SA' : 'en-US')` |
| 11 | `packages/utils/src/date/formatters.ts` | 2 | `toLocaleDateString('ar-SA')` hardcoded Arabic only | Utility output always Arabic | Accept locale as parameter |
| 12 | `apps/courses/src/components/interactive-map/InteractiveMap.tsx` | 198 | `dir="rtl"` hardcoded on root div — remains RTL even when English is active | `dir` not tied to language state | Set `dir` dynamically based on selected language |

## Medium Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 16 | `apps/schedule/src/components/ResultsTab.tsx` | 115, 125, 156 | `"Leave"`, `"Join"`, `"Create Group"` buttons use `mr-2` on icons — **LTR spacing** breaks in RTL | LTR margin class | Replace `mr-2` → `ms-2` |
| 17 | `apps/web/src/pages/login.html` | 89 | `mr-2` on "Remember me" span — LTR margin | Legacy HTML hardcoded | Replace with `ms-2` |
| 18 | `packages/ui/src/components/ui/sidebar.tsx` | 310 | `ml-0` and `ml-2` on SidebarInset — LTR margin | Shadcn sidebar has LTR assumptions | Replace `ml-0` → `ms-0`, `ml-2` → `ms-2` |
| 19 | `packages/ui/src/components/ui/navigation-menu.tsx` | 80 | `ChevronDownIcon` has `ml-1` — LTR gap | Same root cause | Replace `ml-1` → `ms-1` |
| 20 | `packages/ui/src/components/ui/menubar.tsx` | 230, 268 | `ml-auto` on shortcuts and chevron | Same | Replace `ml-auto` → `ms-auto` |
| 21 | `packages/ui/src/components/ui/dropdown-menu.tsx` | 204, 242 | Same `ml-auto` issue | Same | Replace `ml-auto` → `ms-auto` |
| 22 | `packages/ui/src/components/ui/table.tsx` | 102 | `TableHead` uses `text-left` — **LTR alignment hardcoded** | Shadcn default assumes LTR | Use `text-start` which respects `dir` |
| 23 | `packages/ui/src/components/ui/select.tsx` | 125 | `pr-8` on SelectItem checkmark position | RTL requires checkmark on start side | Use `ps-8` or use Radix `dir` prop |
| 24 | `apps/web/src/js/modules/i18n/translations.js` | 1-633 | Translation dictionary covers web app thoroughly but **no schedule/admin/courses keys exist** | i18n built only for legacy web app | Add namespaces for schedule, admin, courses |
| 25 | `apps/web/src/pages/dashboard.html` | 56-65 | Dashboard stat cards have hardcoded Arabic labels not using `data-i18n` | Added without marking for translation | Add `data-i18n` attributes |
| 26 | `packages/ui/src/components/ui/calendar.tsx` | 28-29 | Navigation buttons use `left-1` and `right-1` — may be inverted in RTL | LTR positioning | Consider swapping nav buttons in RTL mode |

## Recommendations

1. **Create shared i18n infrastructure for React apps** — `packages/i18n/src/` with context, dictionaries (AR/EN per app namespace)
2. **Fix all `mr-*` → `ms-*` RTL-incompatible classes** across apps and shared UI components
3. **Tie `dir` attribute to language state** in React apps instead of hardcoding
4. **Add Cairo font to React apps' CSS** (currently only in legacy `apps/web`)
5. **Consolidate ErrorBoundary components** — move one copy to `packages/ui` and wrap messages with `t()`
6. **Add EN translation for admin and schedule HTML pages** — make `<html>` default to LTR, switch on load
