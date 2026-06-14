# مراجعة أمنية ومعمارية — الملفات 21–40

## ملخص تنفيذي

تم مراجعة الملفات 21–40. يوجد **مشكلة حرجة واحدة** (Critical)، **10 مشاكل عالية** (High)، و **14 مشكلة متوسطة/منخفضة** (Medium/Low). أخطر مشكلة: Reflected XSS في `page-verify-email.js` عبر URL hash params. مشاكل REST API متكررة (`select('*')`، عدم sanitation) في 4 ملفات admin. مشاكل accessibility في feedback modal و tour component.

---

## الملف 21: `apps/web/src/js/modules/page-reset-password.js`
**مهارات: security-best-practices, form-cro**

### مشاكل الأمان (High)
1. **السطر 43-55**: أزرار toggle كلمة المرور بدون `aria-pressed` أو `aria-label` متغير — مستخدمو الشاشة لا يعرفون الحالة الحالية (إظهار/إخفاء).
2. **السطر 73**: `submitBtn.innerHTML = '<span>...'` — يستخدم innerHTML مع SVG content (حتى لو ثابت، خطأ معمارى).
3. **السطر 63**: `newPassword.length < 8` — تحقق single rule فقط. لا يوجد check للتعقيد (أحرف كبيرة/صغيرة، أرقام، خاص).

### مشاكل Form CRO (Medium)
1. **السطر 93-95**: `showError` يضيف `textContent` بدون `aria-live="assertive"` — شاشات القارئ لا تعلن الخطأ تلقائياً.
2. **السطر 82**: `form.style.display = 'none'` — بعد النجاح لا يوجد تركيز على رسالة النجاح (`focus()` على successDiv).
3. **السطر 60-70**: validation تعرض خطأ واحد فقط لكل عملية إرسال — لا يجمع الأخطاء (length mismatch + mismatch في آن واحد).

### مشاكل منخفضة (Low)
1. **السطر 84**: `window.location.href = 'login.html'` — hardcoded relative link.
2. **السطر 72**: loading spinner HTML مكرر مع `page-verify-email.js` — يجب أن يكون utility function.

### توصيات
- إضافة `aria-pressed` + `aria-label` متغير لأزرار toggle: `aria-label="إظهار كلمة المرور"` / `aria-label="إخفاء كلمة المرور"`.
- استخدام `submitBtn.textContent` بدلاً من `innerHTML` مع SVG.
- إضافة `aria-live="assertive"` لحاوية `resetError`.
- تحويل validation لجمع كل الأخطاء وعرضها مرة واحدة (parallel validation).

---

## الملف 22: `apps/web/src/js/modules/page-verify-email.js`
**مهارات: security-best-practices, clean-code**

### مشاكل أمنية (Critical)
1. **السطر 27-28**: `showError(errorDescription || errorParam)` — **Reflected XSS** مباشر. `error_description` من URL hash يُمرر مباشرة إلى `textContent` بدون sanitization. مهاجم يصنع رابط: `verify-email.html#error=<img src=x onerror=alert(document.cookie)>`.

### مشاكل clean-code (Medium)
1. **السطر 54-57**: three DOM assignments متتالية بدون check ما إذا كانت `document.querySelector('#verifyError h3')` موجودة — قد يرمي TypeError إذا لم يوجد.
2. **السطر 75-103**: `resendVerification` معرف كـ standalone function (ليس داخل DOMContentLoaded) لكنه يعتمد على `showToast` و `db` من module scope — inconsistency في design pattern مع باقي الدوال.

### توصيات
- **عاجل**: sanitize `errorDescription` و `errorParam` قبل عرضهما: `showError(escapeHtml(errorDescription || errorParam))`.
- إضافة check للعنصر قبل تعديل `textContent`: `const errorTitle = document.querySelector('#verifyError h3'); if (errorTitle) errorTitle.textContent = ...`.
- توحيد pattern: إما كل الدوال داخل DOMContentLoaded أو كلها standalone exported.

---

## الملف 23: `apps/web/src/js/modules/admin.js`
**مهارات: clean-architecture, security-best-practices**

### مشاكل معمارية (High)
1. **السطر 1-15**: God-module re-export — يعيد تصدير كل شيء من 6 ملفات فرعية. ينشئ coupling كبير. clean-architecture تشجع على imports مباشرة من الملفات المطلوبة بدلاً من barrel exports للـ admin module كلها.
2. **السطر 16**: `export { setupSettingsListeners } from './settings.js'` — settings module يصدر listener setup لكنه لا يصدر data fetching، يخلق asymmetric API.

### مشاكل الأمان (Medium)
1. لا يوجد check أن `admin.js` محمي فعلاً قبل تحميل الدوال — أي.module يمكنه استيراد `makeAdmin` واستدعاؤها بدون التحقق من is_admin (التحقق موجود فقط في adminApi لكنه client-side فقط).

### توصيات
- إزالة barrel export (`admin.js`) والاعتماد على imports مباشرة: `import { makeAdmin } from './admin/actions.js'`.
- إضافة documention comment يوضح أن كل الدالة تتطلب is_admin check قبل الاستدعاء.

---

## الملف 24: `apps/web/src/js/modules/admin/index.js`
**مهارات: clean-architecture**

### مشاكل معمارية (High)
1. **السطر 1-16**: exports من `adminApi.js` و `events.js` **أيضاً** موصولة في `admin.js` barrel file — هذا ملف index ثاني لنفس الـ admin module يخلق **circular confusion**.
2. **السطر 18-22**: mixed imports — يصدّر دوال من `auth.js` و `stats.js` و `users.js` و `groups.js` لكنه لا يصدّر `courses.js` أو `settings.js` — API غير مكتمل وغير متناسق.

### مشاكل clean-code (Low)
1. **السطر 23**: سطر فارغ في نهاية الملف.
2. **الملف ككل**: لا يوجد use لهذا الملف — `admin.js` (الملف الشقيق) هو barrel export الرئيسي. هذا الملف يبدو أنه نسخة half-implemented بدون purpose واضح.

### توصيات
- إزالة `admin/index.js` والاعتماد على `admin.js` فقط كـ barrel export، أو دمج两者.
- أو إذا كان `admin/index.js` للاستخدام المحلي و `admin.js` للاستخدام العام، أضف comment يوضح الفرق.

---

## الملف 25: `apps/web/src/js/modules/admin/actions.js`
**مهارات: security-best-practices, clean-code**

### مشاكل الأمان (High)
1. **السطر 5**: `const result = await apiMakeAdmin(userId)` — `apiMakeAdmin` يتحقق من `currentUser.id === userId` لكنه لا يتحقق من أن `userId` موجود فعلاً في قاعدة البيانات قبل الحذف/التعديل. يمكن إرسال `userId` وهمي.

### مشاكل clean-code (Medium)
1. **السطر 1**: imports with alias (`apiMakeAdmin`, `apiRevokeAdmin`...) — الإضافة `as` غير ضرورية إذا لا يوجد تعارض اسم. يزيد من verbosity بدون فائدة.
2. **السطر 4-7**: `makeAdmin(db, userId)` — يقبل `db` كمعامل لكنه لا يستخدمه أبداً (يستدعي `apiMakeAdmin` بدون `db`). يخلق confusion للمطور.
3. **السطر 19-27**: `toggleActive(db, userId, active)` — نفس المشكلة: `db` غير مستخدم.
4. **السطر 29-31**: `deleteGroup(db, groupId)` — `db` غير مستخدم أيضاً.

### توصيات
- إزالة معامل `db` من جميع الدوال لأنه غير مستخدم فعلياً.
- إزالة aliases في imports: `import { makeAdmin, revokeAdmin, ... } from './adminApi.js'`.
- إضافة validation أن `userId` و `groupId` ليسا فارغين قبل الاستدعاء.

---

## الملف 26: `apps/web/src/js/modules/admin/adminApi.js`
**مهارات: rest-api-best-practices, security-best-practices**

### مشاكل REST API (High)
1. **السطر 20**: `body: { action, payload, caller_id: user.id }` — `caller_id` يرسل من العميل (`user.id`). مهاجم يمكن أن يغير `user.id` في localStorage ويصبح أي مشرف. **يجب التحقق من caller_id على الخادم فقط**، لا يُرسل من العميل.
2. **السطر 6-10**: `callAdmin` يتحقق من `user?.is_admin` client-side فقط. Supabase RLS قد يحظر، لكن لا يوجد double-check server-side أن caller فعلاً مشرف.

### مشاكل الأمان (Medium)
1. **السطر 25**: `showToast('فشل: ' + (e.message || ''))` — يعرض `e.message` مباشرة للمستخدم. إذا كانت `e.message` تحتوي على SQL error internals (مثل `PGRST301` أو connection string)، يتم كشفها.
2. **السطر 65-83**: `sendAdminEmail` — يقبل `customEmails` كـ string مفصول بفواصل بدون validation formato (لا يتحقق من صحة كل بريد على حدة).
3. **السطر 32**: `makeAdmin` بدون garantie أن `userId` هو UUID صالح — يمكن إرسال `'; DROP TABLE users; --` كـ userId.

### توصيات
- **إزالة `caller_id` من payload** — الخادم يستخدم `auth.uid()` بدلاً من الاعتماد على العميل.
- sanitize رسائل الخطأ قبل العرض: `showToast('فشل العملية', 'error')` مع logging للخطأ الأصلي في console.
- إضافة email validation regex لكل عنوان في `customEmails` قبل الإرسال.
- إضافة UUID validation لـ `userId` و `groupId` في الدوال.

---

## الملف 27: `apps/web/src/js/modules/admin/users.js`
**مهارات: clean-code, security-best-practices**

### مشاكل clean-code (Medium)
1. **السطر 37-63**: string concatenation لـ HTML داخل `map().join('')` — صعب القراءة和维护. يجب استخدام template literals أو createElement helper.
2. **السطر 34-35**: `const toRemove = tbody.querySelectorAll('tr'); toRemove.forEach(r => r.remove());` — يحذف كل الـ TRs حتى empty row الذي تم إنشاؤه في السطر 27 (`id='usersEmpty'`). ثم السطر 27 يضيفه مرة أخرى. لا يوجد hasId check.

### مشاكل الأمان (Low)
1. **السطر 55**: `data-id="${escapeHtml(u.id)}"` — `escapeHtml` على UUID آمن، لكن بما أن `u.id` قد يكون UUID، `escapeHtml` لا يضر لكنه غير ضروري.

### توصيات
- تحويل string concatenation إلى template literals لتحسين القراءة.
- إضافة `[id]` selector بدلاً من `querySelectorAll('tr')`: `const toRemove = tbody.querySelectorAll('tr:not([id="usersEmpty"])')`.
- استخدام `for...of` بدلاً من `forEach` مع awaiting operations مستقبلاً.

---

## الملف 28: `apps/web/src/js/modules/admin/groups.js`
**مهارات: clean-code, rest-api-best-practices**

### مشاكل REST API (High)
1. **السطر 8**: `select('*')` — يجلب كل الأعمدة بما فيها البيانات الضخمة (مثل `description` الطويلة). REST best practices: حدد الأعمدة المطلوبة فقط: `select('id, name, course_name, course_code, major, current_members, max_members, created_at')`.

### مشاكل clean-code (Medium)
1. **السطر 47**: `escapeHtml(g._creatorName || '-')` — `_creatorName` هو derived field من `enrichCreators` (shared.js). إذا كانت shared.js لا تهرب القيم، هنا يتم تهريبها مرة أخرى (double-escaping محتمل).
2. **السطر 27-31**: inconsistency — `empty?.classList.add('hidden')` بعد `tbody.innerHTML = ''` — الحالة عندما `groups.length === 0` لا تحذف الـ rows، لكنها تضيف `hidden` على `empty` عنصر قد لا يكون موجود أصلاً.

### توصيات
- تغيير `select('*')` إلى select statement محدد بالأعمدة.
- توحيد منطق renderGroups لتفريغ tbody دائماً في البداية.
- توثيق أن `_creatorName` must يكون escaped في `enrichCreators` لتجنب double-escaping.

---

## الملف 29: `apps/web/src/js/modules/admin/courses.js`
**مهارات: clean-code, rest-api-best-practices**

### مشاكل REST API (High)
1. **السطر 9**: `select('*')` — نفس مشكلة groups.js. يجلب كل الأعمدة بلا حاجة.

### مشاكل clean-code (Medium)
1. **السطر 42**: `(document.documentElement.lang === 'ar' ? 'حد أقصى' : 'max')` — التحقق من اللغة يتم في كل عنصر في الـ loop. يجب أن يكون خارج الـ map.
2. **السطر 63-70**: `deleteCourse(db, courseId)` — يقبل `db` لكنه لا يستخدمه (يستدعي `callAdmin` بدون `db`).

### توصيات
- استخدام `select('id, name, code, major, description, instructor, max_members, created_at')` بدلاً من `select('*')`.
- تحويل `lang check` إلى variable خارج الـ loop.
- إزالة معامل `db` غير المستخدم من `deleteCourse`.

---

## الملف 30: `apps/web/src/js/modules/admin/settings.js`
**مهارات: security-best-practices, env-secrets-manager**

### مشاكل الأمن (High)
1. **السطر 9**: `confirm('تأكيد أخير: جميع البيانات ستُحذف نهائياً.')` — `resetAllData` هو إجراء تدميرى بدون二次 تحقق. لا يوجد typing confirmation (`admit "DELETE"`).

### مشاكل البيئة/Secrets (Medium)
1. **السطر 23**: `callAdmin('saveSettings', { siteName, defaultLang, requireEmail, allowRegistration })` — `siteName` قد يحتوي على HTML/XSS. لا يوجد sanitization قبل الإرسال.
2. **السطر 19-20**: `document.getElementById('settingSiteName')?.value` — يقرأ من DOM مباشرة بدون trim أو validation (max length).
3. **الملف كله**: `env-secrets-manager` — لا يوجد أي handling للمعارف (environment variables) أو示明 أن الإعدادات الحساسة (مثل `RESEND_API_KEY`) لا تُعرض في الإعدادات.

### توصيات
- إضافة `siteName` validation: max length (100 chars)، no HTML tags.
- إضافة typing confirmation لـ `resetAllData`: `if (!confirm('اكتب DELETE للتأكيد')) return;` مع input field.
- توثيق أن الإعدادات الحساسة لا تُقرأ من DOM ولا تُعرض للمشرفين (عبر server-side فقط).

---

## الملف 31: `apps/web/src/js/modules/admin/stats.js`
**مهارات: clean-code, rest-api-best-practices**

### مشاكل REST API (High)
1. **السطر 22-30**: three instances of `select('*', { count: 'exact', head: true })` — every query fetches所有 columns مع `count: 'exact'` (العد يتطلب reading data anyway). أفضل ممارسة: حدد الأعمدة.
2. **السطر 31**: `.or(\`last_login.gte.${...},is_active.eq.true\`)` — **SQL injection خطر**. `todayStart.toISOString()` server-generated، لكن إذا كان المهاجم يستطيع manipulation الـ Date object (مثل عبر prototype pollution)، يمكن حقن استعلام. يجب استخدام bind parameters.

### مشاكل clean-code (Medium)
1. **السطر 7-42**: لا يوجد logging عند فشل الـ RPC أو queries — `// fallback below` في السطر 18 يبتلع الخطأ صامتاً.
2. **السطر 14**: `stats.active_today ?? stats.active_users ?? '-'` — fallback chain غامض. لماذا `active_users` كـ بديل لـ `active_today`؟

### توصيات
- تغيير `select('*')` إلى `select('id')` أو حذف select statement (count query لا يحتاج columns).
- استخدام `or('last_login.gte.{date},is_active.eq.true')` فقط بعد التحقق من صحة `date` format.
- إضافة `console.error('[admin-stats] RPC failed:', e)` في catch blocks.

---

## الملف 32: `apps/web/src/js/modules/admin/events.js`
**مهارات: clean-code, clean-architecture**

### مشاكل معمارية (High)
1. **السطر 12-16**: `export const db = null; export let allUsers = []; export let allGroups = []; export let allCourses = []; export let currentTab = 'overview';` — **State God Object** pattern. جميع الـ state للـ admin module مخزن في ملف واحد全局. ينشئ tight coupling و يجعل testing صعب.

### مشاكل clean-code (Medium)
1. **السطر 74-82**: `setupTabs` — ي hybrid import من `window.loadGroups` و `window.loadCourses` بينما يستورد `filterGroups` و `filterCourses` من modules. inconsistency في data loading pattern.
2. **السطر 87-100**: `setupSearchFilters` — لا يوجد debounce على search inputs. كل keystroke يعيد render الـ table بالكامل.

### مشاكل REST/الأمان (Low)
1. **السطر 38**: `window.adminDeleteCourse` dependency — يستدعي window global بدلاً من import مباشر، يخلق coupling غير واضح.

### توصيات
- تحويل `allUsers` / `allGroups` / `allCourses` / `currentTab` إلى module private state مع getters/setters.
- توحيد data loading: إما كلها من `window.*` أو كلها من imports.
- إضافة debounce (300ms) على all search inputs في `setupSearchFilters`.

---

## الملف 33: `apps/web/src/js/modules/admin/auth.js`
**مهارات: clerk-auth, security-best-practices**

### مشاكل الأمن (High)
1. **السطر 25-40**: try-catch يلتهم كل الأخطاء (`catch (e) { showAccessDenied(); return false; }`). إذا فشل query (`db.from('users').select(...)`) بسبب network error، المستخدم يرى "access denied" بدلاً من "connection error". يخفي bugs حقيقية.

### مشاكل clean-code (Medium)
1. **السطر 7**: `window.initSupabase?.() ?? window.getDb?.()` — ?? له الأولوية على ||، لكن هنا النتيجة واحدة. الخلط بين `??` و `||` بدون explanation.
2. **السطر 19**: `window.getCurrentUser?.()` — يعتمد على window global. clerk-auth skill تشجع على dependency injection.
3. **السطر 43-45**: `showAccessDenied` functions بدلاً exported — لا يمكن اختبارها من الخارج.

### توصيات
- فصل الأخطاء: catch instanceof Error → if (network) showNetworkError() else showAccessDenied().
- تحويل `window.getCurrentUser` و `window.initSupabase` إلى معاملات passed في `checkAdminAccess(db, getUserFn)`.
- تصدير `showAccessDenied` أو تحويلها إلى module-level display function.

---

## الملف 34: `apps/web/src/js/modules/ocr.js`
**مهارات: security-best-practices, clean-code**

### مشاكل الأمن (Medium)
1. **السطر 153-158**: `body: { base64Image: base64DataUrl }` — يرسل base64 string كـ body بدون size check. يمكن إرسال 10MB+ base64 string يسبب DoS على الـ edge function.
2. **السطر 10-20**: `isNoise` regex — لا يوجد max length check. يمكن لـ malicious input line أن يكون 100KB string يحمل regex backtrackingattack (ReDoS) عبر `/^\w+_\w+_\w+/`.

### مشاكل clean-code (Low)
1. **السطر 54**: `courseWords` regex مع 25+ word — hardcoded list يجب أن تكون config أو constant فيBeginning of file.
2. **السطر 206**: `window.extractScheduleFromImage = extractScheduleFromImage` — re-assigns to window بدون check إذا كانت موجودة (يمكن أن يبدل دالة من module آخر).

### توصيات
- إضافة `base64Image.length < 5_000_000` check (5MB limit) قبل الاستدعاء.
- إضافة length check في `isNoise`: `if (t.length > 200) return true;` قبل regex tests.
- تصدير `COURSE_KEYWORDS` كـ module constant بدلاً من inline regex.
- استخدام `window.extractScheduleFromImage ??= extractScheduleFromImage` (nullish assign) بدلاً من assignment مباشر.

---

## الملف 35: `apps/web/src/js/modules/email.js`
**مهارات: security-best-practices, clean-code**

### مشاكل الأمن (Medium)
1. **السطر 130-131**: `.map(u => u.email).filter(e => e && e.includes('@'))` — يقرأ كل الـ emails من قاعدة البيانات بلا authorization check client-side (يعتمد على RLS لكن لا يوجد fallback).
2. **السطر 46**: `if (response.data.error === 'RATE_LIMIT_EXCEEDED' && attempt < retries)` —hardcoded string `'RATE_LIMIT_EXCEEDED'` repeated. يجب أن يكون constant.

### مشاكل clean-code (Medium)
1. **السطر 78-103**: `sendBulkEmail` — يعالج 50 email/batch مع `sleep(1100)` بين batches. 50 × retry(3) = 150 invocation لكل bulk send. لا يوجد batch progress tracking أو abort mechanism.
2. **السطر 28**: `body: { to: options.to }` — `options.to` يمكن أن يكون array (bulk) أو string (single). لا يوجد validation للفرق بينهما.

### توصيات
- إضافة `RATE_LIMIT_EXCEEDED` و `MAX_RECIPIENTS` كـ exported constants في top of file.
- إضافة input validation: `if (Array.isArray(options.to) && options.to.length > 50) throw new Error('TOO_MANY_RECIPIENTS')`.
- إضافة AbortController support للـ bulk send للسماح بإلغاء العملية.

---

## الملف 36: `apps/web/src/js/modules/feedback.js`
**مهارات: security-best-practices, form-cro**

### مشاكل الأمن (High)
1. **السطر 328-335**: `JSON.parse(currentUser)` — يقرأ `svu_user_data` من localStorage. لا يوجد validation أن الـ JSON صالح أو أن `id` هو UUID. يمكن لـ localStorage poisoning أن يسبب injection في قاعدة البيانات (إذا لم يكن RLS يمنع).
2. **السطر 309-314**: `feedbackData` يحتوي على `page: window.location.pathname` — يرسل معلوماتbreadcrumb للمستخدم كـ feedback data بدون consent.

### مشاكل Form CRO (Medium)
1. **السطر 188-192**: `textarea` بدون `aria-describedby` مرتبط بالـ label — screen readers لا تربط الـ label بالـ input بشكل صحيح (يجب إضافة `label.htmlFor = 'fbText'` و `textarea.id = 'fbText'`).
2. **السطر 243-252**: hover events على stars فقط — لا يوجد keyboard support. المستخدمون الذين يستخدمون keyboard فقط لا يمكنهم تحديد الـ rating (لا يوجد `tabindex` أو keydown handlers).
3. **السطر 279-285**: overlay click يغلق الـ modal بدون check إذا كان المستخدم قد أرسل feedback فعلاً — يمكن فقدان البيانات.

### مشاكل Accessibility (High)
1. **الملف كله**: `.fb-overlay` و `.fb-modal` بدون `role="dialog"` و `aria-modal="true"` — شاشات القارئ لا تعرف أن这是一个 modal dialog.
2. **السطر 367**: `setTimeout(() => hideModal(overlay), 3500)` — يغلق الـ modal تلقائياً بعد 3.5 ثواني بدون `aria-live="polite"` يخبر المستخدم ما يحدث.

### توصيات
- إضافة `role="dialog"` و `aria-modal="true"` و `aria-labelledby` على overlay.
- إضافة keyboard navigation للـ stars: `tabindex="0"` + keydown handler (ArrowLeft/ArrowRight).
- إضافة validation: `if (!currentUser || !isValidUUID(currentUser.id)) userId = null;` قبل الإرسال لقاعدة البيانات.
- إضافة `aria-describedby` يربط الـ label بالـ textarea.

---

## الملف 37: `apps/web/src/js/modules/tour.js`
**مهارات: clean-code, senior-frontend**

### مشاكل clean-code (Medium)
1. **السطر 1**: barrel export فقط — لا يضيف قيمة. نفس مشكلة `admin/index.js`. ملف من 1 سطر يعيد تصدير من `tour-main.js`.

### توصيات
- إزالة barrel file (`tour.js`) والاعتماد على imports مباشرة من `tour/tour-main.js`.
- أو دمج المحتوى في `tour-main.js` مباشرة.

---

## الملف 38: `apps/web/src/js/modules/tour/tour-main.js`
**مهارات: clean-code, accessibility-compliance**

### مشاكل Accessibility (High)
1. **السطر 147-148**: `pop.style.left = '50%'; pop.style.transform = 'translate(-50%, -50%)';` — centered popover بدون `role="dialog"` أو `aria-modal` أو `aria-labelledby` مرتبط بالعنوان.
2. **السطر 49-82**: `_show(idx)` — عند التنقل بين الـ steps، لا يوجد `aria-live="polite"` يعلن عن تغيير المحتوى للمستخدمين الذين يستخدمون شاشات القارئ.

### مشاكل clean-code (Medium)
1. **السطر 125-228**: `_positionPopover` — 103 سطر في دالة واحدة. تنتهك Single Responsibility Principle. يجب تقسيمها إلى: `_calculatePosition`, `_applyHorizontalPosition`, `_applyVerticalPosition`, `_clampToViewport`.
2. **السطر 88-110**: `_highlightAndPosition` — creates closed-over timers (`scrollSettleTimer`, `maxWaitTimer`) بدون clear في جميع الـ code paths. إذا أُعيد استدعاء `_highlightAndPosition` قبل انتهاء الـ timers السابقة، توجد memory leak.

### توصيات
- إضافة `role="dialog"` و `aria-modal="true"` و `aria-labelledby` على popover element.
- إضافة `aria-live="polite"` على container المحتوي للtitle و description ليتم الإعلان عن التغييرات.
- تقسيم `_positionPopover` إلى دوال مساعدة أصغر.
- إضافة `clearTimeout` لجميع الـ timers في بداية `_highlightAndPosition`.

---

## الملف 39: `apps/web/src/js/modules/tour/tour-steps.js`
**مهارات: clean-code, senior-frontend**

### مشاكل clean-code (Low)
1. **السطر 5-13**: `STEPS` array — كل step يعتمد على `target`Selector في الـ DOM. لا يوجد validation في runtime أن الـ target موجود فعلاً. إذا حذف عنصر `[data-tour="user-card"]` من HTML، التور ينهار بصمت (ينتقل للـ centered step).

### مشاكل senior-frontend (Low)
1. **السطر 1**: `import { t as i18nT } from '../i18n.js';` — alias `t as i18nT` بدون داعٍ. الاسم الأصلي `t` أوضح.
2. **السطر 15-16**: `tr(key) { return i18nT(key); }` — wrapper بدون منطق إضافي. يمكن استخدام `i18nT` مباشرة.

### توصيات
- إضافة validation في `init()` أو `start()` أن كل الـ targets موجودة قبل بدء التور.
- إزalias `i18nT` واستيراد `t` مباشرة، أو توحيد الاسم.

---

## الملف 40: `apps/web/src/js/modules/tour/tour-handlers.js`
**مهارات: clean-code, senior-frontend**

### مشاكل clean-code (Medium)
1. **السطر 7-13**: `_keyHandler` معرف كـ arrow function مُسنّد على `tour._keyHandler` — إذا نُسيت `unbindEventHandlers` على `_destroy()`، يبقى listener مُفعل. في `unbindEventHandlers` (سطر 67) يتم الإزالة، لكن إذا لم يتم استدعاؤها بسبب bug، هناك memory leak.
2. **السطر 15-19**: `_resizeHandler` و `_scrollHandler` — كلاهما يستدعي `_reposition()` مع debounce. لكن `MutationObserver` في السطر 30-47 observer على `document.body` subtree بالكامل — يمكن أن يسبب performance issues في DOMs كبيرة.

### مشاكل senior-frontend (Low)
1. **السطر 56-58**: `pop.querySelector('#t8next')`/`#t8prev'`/`'#t8skip'` — لا يوجد check أن الـ elements موجودة قبل إضافة event listeners. إذا `buildTourDOM` فشل في إنشاء هؤلاء، يرمي TypeError.

### توصيات
- إضافة destructor guarantees: استخدام `try { ... } finally { unbindEventHandlers(tour) }` في `_destroy()`.
- تقليل `MutationObserver` scope: إضافة `attributeFilter` إضافي (مثل `data-*` فقط) أو observer على container محدد بدلاً من `document.body`.
- إضافة check: `const nextBtn = pop.querySelector('#t8next'); if (!nextBtn) return;` قبل `addEventListener`.

---

## خلاصة المشاكل حسب الخطورة

| # | الملف | المشكلة | الخطورة |
|---|-------|----------|---------|
| 1 | page-verify-email.js | Reflected XSS عبر error_description hash param | **Critical** |
| 2 | adminApi.js | caller_id من العميل (يمكن تزويره) | **High** |
| 3 | adminApi.js | لا يوجد server-side is_admin verification | **High** |
| 4 | adminApi.js | رسائل خطأ تعرض internals للمستخدم | **High** |
| 5 | stats.js | SQL injection خطر في `.or(\`last_login.gte...\`)` | **High** |
| 6 | feedback.js | overlay بدون role="dialog" / aria-modal | **High** |
| 7 | feedback.js | localStorage poisoning → DB injection | **High** |
| 8 | tour-main.js | popover بدون role="dialog" و aria-labelledby | **High** |
| 9 | admin/index.js | ملف index مكرر يخلق architecture confusion | **Medium** |
| 10 | actions.js | معامل `db` غير مستخدم في جميع الدوال | **Medium** |
| 11 | groups.js | `select('*')` بدون تحديد الأعمدة | **Medium** |
| 12 | courses.js | `select('*')` بدون تحديد الأعمدة | **Medium** |
| 13 | stats.js | `select('*')` × 3 مرات | **Medium** |
| 14 | events.js | God Object: global state في ملف واحد | **Medium** |
| 15 | page-reset-password.js | buttons بدون aria-pressed | **Medium** |
| 16 | feedback.js | stars بدون keyboard navigation | **Medium** |
| 17 | page-verify-email.js | DOM queries بدون null checks | **Medium** |
| 18 | ocr.js | base64 size غير محدد → DoS محتمل | **Medium** |
| 19 | settings.js | siteName بدون sanitization | **Medium** |
| 20 | email.js | bulk send بدون progress/abort | **Medium** |

---

## التوصيات العامة (21–40)

### 🔴 عاجل (Critical/High)
1. **إصلاح XSS** في `page-verify-email.js` — sanitize `error_description` و `error_param` فوراً
2. **إزالة `caller_id`** من `adminApi.js` payload — التحقق must يكون server-side فقط
3. **إضافة server-side admin check** — لا تثق بـ `user.is_admin` من العميل
4. **تحديد الأعمدة** في groups.js, courses.js, stats.js (`select('*')` → `select('id, name, ...')`)
5. **إضافة `role="dialog"` + `aria-modal`** على feedback modal و tour popover
6. **إصلاح SQL injection** في stats.js `.or(...)` — استخدم bind parameters

### 🟡 متوسط (Medium)
7. **إزالة `admin/index.js`** الملف المكرر وتوحيد barrel export
8. **إزالة معامل `db`** غير المستخدم من `actions.js`
9. **إصلاح God Object** في `events.js` — تحويل global state إلى private closures
10. **إضافة validation** لـ `siteName` في settings.js (max length، no HTML)
11. **إضافة base64 size check** في ocr.js (5MB limit)

### 🟢低 (Low)
12. **إضافة keyboard navigation** لـ feedback stars (tabindex + keydown)
13. **إضافة debounce** على search inputs في `events.js` (shared.js exports `debounce`)
14. **تقسيم `_positionPopover`** في tour-main.js إلى دوال مساعدة
15. **إزالة barrel files** غير الضرورية (`tour.js`, `admin/index.js`)

---

*تاريخ المراجعة: 2026-06-15*
*المجموعة: الملفات 21–40 من أصل 40*
