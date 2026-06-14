# مراجعة أمنية — الملفات 1-10

تاريخ المراجعة: 2026-06-15
النطاق: package.json (جذر) + apps/web/package.json + apps/web/src/app.js + 8 ملفات وحدات
المنهجية: مراجعة كود ثابت + تحليل بنية + فحص ثغرات معروفة

---

## 1. package.json (الجذر)

### 🔴 HIGH — مستوى تدقيق npm منخفض
```
"audit": "npm audit --audit-level=moderate"
```
الخطأ: `--audit-level=moderate` يتجاهل الثالث (high) والرابع (critical) عند إرجاع كود غير صفري، مما قد يسمح بتمرير ثغرات حرجة في CI.
التوصية: استخدم `--audit-level=high` أو `--audit-level=critical` في pipelines CI، واجعل `audit:fix` يعمل تلقائياً على الفروع الآمنة فقط.

### 🟡 MEDIUM — عدم وجود حقل `engines` في apps/web/package.json
التطبيق الفرعي `apps/web` لا يحدد حداً أدنى لـ Node.js أو npm، بينما الجذر يحدد `node >= 18.0.0`. قد يتم تشغيله على إصدارات قديمة غير مدعومة.
التوصية: أضف حقل `engines` في `apps/web/package.json`.

### 🟡 MEDIUM — clean script غير متوافق مع Windows
```json
"clean": "rm -rf dist"
```
الأمر `rm` غير موجود في PowerShell/WindowsCMD. تم وضع علامة على بيئة النظام كـ `win32`.
التوصية: استخدم `rimraf` أو `del-cli` أو غيّر إلى `rmdir /s /q dist` في script منفصل لـ Windows.

### 🟢 INFO — ملفات lock مفقودة من المسح
لم يتم العثور على `package-lock.json` أو `pnpm-lock.yaml` أو `yarn.lock` في glob النتائج. بدون ملف قفل، `npm install` قد يسحب إصدارات مختلفة في كل مرة.
التوصية: تأكد من وجود ملف قفل محلي ويتم إيداعه في Git.

---

## 2. apps/web/package.json

### 🟡 MEDIUM — لا توجد قيود على TypeScript/JSlint للأمان
لا توجد إشارة إلى `eslint-plugin-security` أو `eslint-plugin-no-secrets` أو قواعد منع `eval`/`Function` في التكوين.
التوصية: أضف `eslint-plugin-security` و`eslint-plugin-no-secrets` وقم بتفعيل القواعد:
```json
"rules": {
  "security/detect-object-injection": "error",
  "security/detect-non-literal-fs-filename": "warn",
  "security/detect-eval-with-expression": "error"
}
```

### 🟡 MEDIUM — عدم وجود إعداد reproduciable builds
لا يوجد `sideEffects` أو `module` أو `exports` في الحزمة، مما يمنع التصغير الأمثل ويترك الباب مفتوحاً لـ tree-shaking غير متوقع.

---

## 3. apps/web/src/app.js

### 🔴 HIGH — مطابقة مسار ضعيفة (Path Traversal Risk)
```javascript
function getPageName() {
  const path = window.location.pathname;
  if (path.includes('dashboard')) return 'dashboard';
  if (path.includes('courses')) return 'courses';
  return null;
}
```
الخطأ: `includes()` تطابق جزئياً. المسار `/courses-archive` سيعيد `'courses'`، و`/admin/courses` سيفعل تحميل وحدة `page-courses` بشكل غير مقصود. حتى لو كان `getPageModuleName` يتحكم بالقائمة، فإن منطق التوصيف يستند إلى تطابق جزئي غير آمن.
التوصية: استخدم `startsWith()` مع محاذاة المسار أو تحقق من المسار الكامل:
```javascript
if (path === '/dashboard' || path.startsWith('/dashboard/')) return 'dashboard';
if (path === '/courses'   || path.startsWith('/courses/'))   return 'courses';
```

### 🟡 MEDIUM — تحميل وحدة ديناميكي غير محصن
```javascript
async function loadPageModule(page) {
  const moduleName = getPageModuleName(page);
  await import(moduleName);
}
```
على الرغم من أن `getPageModuleName` يحدد القائمة، فإن `import()` يتلقى سلسلة ثابتة — هذا جيد. لكن إذا تم تعديل `getPageName` مستقبلاً لقبول مدخلات المستخدم مباشرة، يصبح هذا ثغرة تحميل وحدة عشوائية.
التوصية: ضع `moduleName` في `allowedModules` كتحقق إضافي قبل `import()`.

### 🟡 MEDIUM — تهرب HTML غير ضروري
```javascript
const welcomeName = escapeHtml(name);
existing.textContent = 'مرحباً بك ' + welcomeName + '!';
```
`textContent` لا يفسر HTML، لذا `escapeHtml` مفرط الاستخدام وغير ضروري. لا يسبب ثغرة، لكنه يعطي وهم أمن كاذب.
التوصية: إما أزله (لأن `textContent` آمن) أو اشرح في تعليق لماذا يتم الهروب إذا كان there احتمال استخدام `innerHTML` لاحقاً.

### 🟡 MEDIUM — التحقق من البريد الإلكتروني ضعيف
```javascript
if (!email || !email.includes('@')) {
```
التحقق بالاعتماد على `includes('@')` فقط يسمح بعناوين غير صالحة مثل `a@`، `@b`، `a@@b`، `a@b@c`. هذا لا يسبب ثغرة أمنية مباشرة، لكنه قد يؤدي إلى سلوك غير متوقع في Supabase Auth.
التوصية: استخدم مدخل email من وسم `<input type="email">` + تحقق HTML5 + معالجة أخطاء Supabase (التي تقوم بالتحقق الفعلي).

### 🟢 INFO — معالجة أخطاء وصول Supabase
```javascript
const db = await getDb();
if (!db) throw new Error('Supabase not configured');
```
هذا جيد — يفشل بسرعة بدلاً من التصرف بصمت. لكن انظر إلى `config.js` حيث يتم إسكات الأخطاء في الإنتاج.

---

## 4. apps/web/src/js/modules/config.js

### 🔴 CRITICAL — الجلسة لا ت persisted (فقدان تسجيل الدخول عند التحديث)
```javascript
auth: {
  persistSession: false,
  autoRefreshToken: true,
},
```
الخطأ: `persistSession: false` يمنع Supabase JS SDK من حفظ الجلسة في sessionStorage/localStorage. تعليق `session.js` (سطر 4-11) يقول "Supabase handles persistence" — لكن هذا غير صحيح مع هذا الإعداد. النتيجة: المستخدم يُطلّق عند تحديث الصفحة.
- هذا ليس مجرد عيب UX؛ فقدان الجلسة يدفع المستخدم لإعادة إدخال كلمة المرور، مما يزيد من تعرض كلمة المرور لهجمات keylogging shoulder-surfing.
التوصية:  
الخيار A (مُرَغَّب): غيّر إلى `persistSession: true` أو أزلها (الافتراضي `true`) وأجرِ مراجعة مفكرة لحلقة الجلسة.  
الخيار B: إذا كنت تريد جلسات قصيرة العمر، فحدد `SESSION_TIMEOUT` واضبط `autoRefreshToken` بشكل صريح.

### 🔴 HIGH — إسكات الأخطاء في الإنتاج
```javascript
if (import.meta.env?.DEV) {
  console.error('[Config] Supabase init failed:', ...);
}
if (import.meta.env?.DEV) {
  throw _configError;
}
return null; // في الإنتاج: صمت كامل
```
في الإنتاج (`import.meta.env?.DEV` === false)، يتوقف التطبيق عن العمل بدون Supabase دون أي خطأ مطبعي أو استثناء. المستخدم يواجه واجهة فارغة/ معطلة. هذا هجوم محتمل Denial-of-Service بسيط: تغيير `window.SVU_ENV` يؤدي إلى فشل صامت.
التوصية:  
- في `initSupabase`: أَظْهِر UI error state بدلاً من `return null` (أرسل حدث للنظام الأمامي).  
- في `getSessionFromDb` و`verifySessionWithServer`: إذا كان `db` null، أَعِد `null`/`false` مع تتبع حدث `window.dispatchEvent(new CustomEvent('svu-config-error', ...))`.

### 🟡 MEDIUM — تحقق مفاتيح Supabase ضعيف
```javascript
function isValidAnonKey(key) {
  if (key.length < 20) return false;
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  return true;
}
```
التحقق يفحص الشكل فقط (3 أجزاء مفصولة بنقاط) ولا يتحقق من أن كل جزء هو base64url صالح. لكن بما أن المفتاح Anonymous عام (غير سري)، فإن هذا لا يشكل خطر أمني مباشر — فقط خطأ في التكوين.

### 🟢 INFO — تكرار كتلة `import.meta.env?.DEV`
```javascript
if (import.meta.env?.DEV) { ... }
if (import.meta.env?.DEV) { ... }
```
تم تكرار الشرط مرتين بدلاً من دمجها:
```javascript
if (import.meta.env?.DEV) {
  console.error(...);
  throw _configError;
}
```
تحسين قابلية الصيانة فقط.

---

## 5. apps/web/src/js/modules/core.js

### 🔴 HIGH — استنزاف معلومات من رسائل خطأ Supabase
```javascript
function handleRegisterError(error) {
  if (msg.includes('already registered')) return 'البريد الإلكتروني أو اسم المستخدم مسجّل مسبقاً';
  if (msg.includes('Invalid email')) return 'البريد الإلكتروني غير صالح';
```
مطابقة النص الفرعي تعزل حالة البريد الإلكتروني المسجل مسبقاً عن الحالة غير المسجلة. المخترق يستخدم هذا لتعداد الحسابات (Account Enumeration).
التوصية: اجعل كل رسائل الخطأ العامة في كلا المسارين (التسجيل وتسجيل الدخول):
```javascript
return 'فشل العملية. يرجى التحقق من البيانات والمحاولة مرة أخرى.';
```

### 🟡 MEDIUM — حالة المستخدم المُخَزَّنة مؤقتاً (cachedUser) غير متزامنة
`let cachedUser = null` على مستوى الوحدة. إذا فتح المستخدم علامتين تبويب، يمكن أن يصبح `cachedUser` قديماً في إحداهما بعد تسجيل الخروج في الأخرى.
التوصية: استمع إلى `storage` events أو `auth state change` من Supabase لتحديث/مسح `cachedUser` تلقائياً:
```javascript
window.addEventListener('storage', (e) => {
  if (e.key === AUTH_CONFIG.STORAGE_KEY) clearUserSession();
});
```

### 🟡 MEDIUM — Sentry beforeSend يمسح user.id
```javascript
delete event.user.id;
```
حذف `id` جيد، لكن `event.user` قد يحتوي على `username` لم يتم حذفه. Sentry يلتقط `event.user` من تلقاء نفسه — تحقق من أن `extra` و `contexts` لا يحتويان على PII إضافية.

### 🟡 MEDIUM — قاعدة رفع مستوى الصلاحيات غير متحققة
```javascript
if (profileData.is_active === false) return null;
```
الشرط يرفض المستخدم غير النشط، لكن في `auth-guard.js` يتحقق الإداري من `is_active` مرة أخرى عبر استعلام مباشر. هذا يسمح بمصادقة مستخدم عادي غير نشط، لكنه لا يحد من قدرته على الوصول إلى مسارات عادية. However: `is_active === false` في `core.js` يقابل أيضاً المستخدمين الذين لم يتم تفعيلهم بعد (مثل email confirmation pending).
التوصية: فكر في دمج حالة `is_active` مع Supabase Auth (signUp مع `email_confirm: true`).

---

## 6. apps/web/src/js/modules/hash-router.js

### 🟡 MEDIUM — عدم تطهير مسار URI المُفكَّك
```javascript
const decoded = decodeURIComponent(path);
```
`decodeURIComponent` يمكن أن ينتج أحرف تحكم (`\x00`, newline) أو HTML-encoded characters. على الرغم من أن ذلك لا يسبب XSS مباشرة (لأنه لا يتم إدراجه في DOM)، فإنه يمكن أن يتسبب في سلوك غير متوقع إذا تم تمريره إلى `innerHTML` لاحقاً.
التوصية: أضف تنظيفاً:
```javascript
const decoded = decodeURIComponent(path).replace(/[\x00-\x20]/g, '');
```

### 🟡 MEDIUM — تسلسل hashchange قد يتسبب في حالة سباق
```javascript
window.addEventListener('hashchange', handleRoute);
handleRoute();
```
إذا تم استدعاء `navigate()` مرتين بسرعة (مثل `navigate('/dashboard')` → `navigate('/courses')`)، يمكن أن يتداخل `hashchange` مع `handleRoute()` إذا كان المعالج غير متزامن.
التوصية: استخدم `requestAnimationFrame` أو أضف `isNavigating` flag لمنع التداخل.

### 🟢 INFO — لا توجد حماية لـ Open Redirect
المسارات داخلياً فقط (hash-based)، والتحويل (`navigate`) يغير `window.location.hash` فقط ولا يسبب open redirect. ممتاز.

---

## 7. apps/web/src/js/modules/csrf.js

### 🔴 HIGH — نطاق cookie خاطئ للاستخدام المقصود
```javascript
document.cookie = `${CSRF_COOKIE_NAME}=${token}; path=/; SameSite=Lax; ...`;
```
الخطأ: `path=/` يعني أن الكعكة (cookie) تُرسل إلى **كل** الطلبات على نفس الأصل، بما في ذلك نقاط نهاية Supabase إذا كان هناك وكيل عكسي (reverse proxy) على نفس النطاق. هذا يتجاوز عزل SameSite=Lax.
التوصية: ضع `path` على المسار الجذري للتطبيق فقط (مثل `path=/apps/web/`) أو استخدم نطاق فرعي منفصل للواجهة الخلفية.

### 🟡 MEDIUM — اقتران Supabase عبر رفع طريقة (Monkey-patching) هش
```javascript
db.from = function (table) { ... };
```
هذا يعدل原生 Supabase client. إذا قام Supabase بتحديث تنفيذ `db.from()` أو أضاف مسارات طلب لا تمر عبر `from()` (مثل `db.auth.signInWithPassword`)، فسيتم تخطي protection CSRF.
التوصية: استخدم `db.supabaseUrl` + `db.supabaseKey` مباشرة أو أنشئ غلاف (wrapper) بدلاً من تعديل العميل مباشرة.

### 🟢 INFO — CSRF token لا يحمي من هجمات CSRF ضد Supabase
Supabase Auth يستخدم Bearer token في رأس `Authorization` header، وليس cookies. طلبات Supabase هي XHR/Fetch إلى `*.supabase.co` (origin مختلف)، لذلك:
1. SameSite=Lax لا يمنع إرسال these requests.
2. الـ CSRF token في الرأس يحمي فقط من نفس الأصل CSRF على نقاط نهاية API خاصة بك (إن وجدت).
التوصية: وثق هذا التصميم في قسم Security Architecture. إذا كان التطبيق يستhd proxies محلية، فتأكد من أن الـ CSRF token يتحقق في الخادم.

---

## 8. apps/web/src/js/modules/encrypted-storage.js

### 🟡 MEDIUM — تحويل القيمة غير مناسب للكائنات
```javascript
export function storageSet(key, value) {
  localStorage.setItem(key, String(value));
}
```
إذا تم تمرير كائن، `String(value)` يعطي `[object Object]` بدلاً من تسلسل JSON.
التوصية:
```javascript
export function storageSet(key, value) {
  const toStore = typeof value === 'string' ? value : JSON.stringify(value);
  localStorage.setItem(key, toStore);
}
export function storageGet(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return raw; }
}
```

### 🟢 INFO — اسم الوحدة مضلل
اسم `encrypted-storage.js` يوحي بالتشفير، لكن الوحدة تستخدم localStorage plain-text. التعليقات توضح هذا بشكل صريح — ممتاز.  
لكن يجب تفادي استخدام اسم يحتوي على "encrypted" لمنع سوء الاستخدام المستقبلي.  
التوصية: أعِد تسميتها إلى `plain-storage.js` أو `ui-storage.js`.

---

## 9. apps/web/src/js/modules/auth/auth-guard.js

### 🔴 HIGH — خطأ في معالجة فشل استعلام المشرف
```javascript
} catch (err) {
  if (!silent) window.location.href = AUTH_REDIRECT;  // ← خطأ!
}
```
عند فشل استعلام قاعدة بيانات `is_admin`/`is_active` (مثل انقطاع الشبكة)، يتم إعادة توجيه المشرف إلى صفحة تسجيل الدخول (AUTH_REDIRECT) بدلاً منUnauthorized (UNAUTHORIZED_REDIRECT). هذا يعني أن المستخدم المصرح له يُعامل وكأنه غير مصادق.
التوصية:
```javascript
} catch (err) {
  if (!silent) window.location.href = UNAUTHORIZED_REDIRECT;
  return null;
}
```

### 🟡 MEDIUM — `getDb() || initSupabase()` مكرر
```javascript
const db = getDb() || initSupabase();
```
`getDb()` يستدعي `initSupabase()` داخلياً. إذا كان Client null، يتم استدعاء `initSupabase()` مرة أخرى. هذا غير ضار بسبب النمط Singleton، لكنه غير واضح.
التوصية: ببساطة `const db = getDb();`.

### 🟢 INFO — صلاحيات مزدوجة للتحقق
التحقق المزدوج (`verifySessionWithServer` + `getCurrentUser`) ممتاز لمنع傲 session theft و token tampering.

---

## 10. apps/web/src/js/modules/auth/session.js

### 🟡 MEDIUM — عدم التحقق من صحة refreshToken
```javascript
export async function setSession(refreshToken) {
  if (!refreshToken || typeof refreshToken !== 'string') {
    throw new Error('Invalid refresh token');
  }
```
لا يتحقق من الطول أو التنسيق. Supabase سترفض token غير صالح، لكن التحقق المبكر يعطي رسائل خطأ أوضح.
التوصية: أضف Length check ( refreshing tokens عادة 100+ حرف):
```javascript
if (refreshToken.length < 50) throw new Error('Invalid refresh token format');
```

### 🟡 MEDIUM — Session module ينفذ إحصائيات تسجيل خروج غير متأكد
`clearSession` يستدعي `supabase.auth.signOut()`. مع `persistSession: false` (من config.js)، لا توجد جلسة محفوظة، لكن Supabase SDK قد يرسل طلب إبطال إلى الخادم. هذا جيد إذا كان الهدف هو إبطال refresh_token في الخادم.  
لكن انظر إلى `isLoggedIn` في `core.js` الذي يستدعي `db.auth.getUser()` — إذا توقفت الجلسة عن العمل، سيتم إرجاع `null` لكن لن يتم مسح `cachedUser` تلقائياً.
التوصية: أضف معالج `onAuthStateChange`:
```javascript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') clearUserSession();
});
```

---

## ملخص الثغرات حسب الخطورة

| # | الملف | الخطورة | المشكلة |
|---|-------|---------|---------|
| 1 | config.js | 🔴 CRITICAL | `persistSession: false` → فقدان جلسة عند التحديث |
| 2 | config.js | 🔴 HIGH | إسكت الأخطاء في الإنتاج → فشل صامت |
| 3 | app.js | 🔴 HIGH | مطابقة مسار جزئية → تحميل وحدة غير مقصودة |
| 4 | csrf.js | 🔴 HIGH | نطاق cookie `path=/` واسع جداً |
| 5 | auth-guard.js | 🔴 HIGH | فشل استعلام المشفر → توجيه لصفحة خاطئة |
| 6 | core.js | 🔴 HIGH | رسائل خطأ تكشف وجود الحساب (Account Enum) |
| 7 | csrf.js | 🟡 MEDIUM | اقتران Supabase هش (monkey-patch) |
| 8 | encrypted-storage.js | 🟡 MEDIUM | `String(value)` يفقد الكائنات |
| 9 | encrypted-storage.js | 🟡 MEDIUM | اسم وحدة مضلل (encrypted ← plain) |
| 10 | app.js | 🟡 MEDIUM | تحقق بريد إلكتروني ضعيف |
| 11 | hash-router.js | 🟡 MEDIUM | decodeURI بدون تنظيف |
| 12 | package.json | 🟡 MEDIUM | تدقيق npm على مستوى moderate فقط |
| 13 | session.js | 🟡 MEDIUM | عدم التحقق من صحة refreshToken |
| 14 | core.js | 🟡 MEDIUM | cachedUser يتعرض للتزمن في علامات تبويب متعددة |
| 15 | package.json (web) | 🟡 MEDIUM | `rm -rf` غير متوافق مع Windows |

---

## توصيات أولية للفترة القادمة (1-10)

### 🔴 أمان — يجب إصلاحها قبل الإطلاق
1. **config.js** — راجع `persistSession` + أضف نظام إبلاط أخطاء في الإنتاج
2. **auth-guard.js** — أصلح catch block ليعيد `UNAUTHORIZED_REDIRECT`
3. **csrf.js** — وثق نطاق cookie + فكر في حماية بديلة
4. **app.js + core.js** — ثابت رسائل خطأ عامة

### 🟡 تحسين — يفضل قبل الإنتاج
5. **encrypted-storage.js** — أصلح JSON serialization + أعد تسمية الوحدة
6. **hash-router.js** — صلّح مسار التطابق + تنظيف URI
7. **session.js** — أضف onAuthStateChange listener
8. **package.json** — ارفع مستوى التدقيق + أصلح clean script

---

## ملفات 11-20 — جاهزة للمراجعة

بعد تصحيح المشاكل الحرجة أعلاه، تتابع المراجعة بالترتيب:
11. auth.js, 12. shared.js, 13. i18n/index.js, 14. api.js, 15. page-login.js, 16. register-api.js, 17. validation.js, 18. page-dashboard.js, 19. page-courses.js, 20. page-home.js
