# خطة عمل للإصلاحات الحرجة

## الإصلاحات المطلوبة:
1. ~~حماية XSS في localStorage (تطبيق escapeHtml)~~ ✅ تم — `escapeHtml` مطبق على مدخلات المستخدم الصريحة (`page-login.js`, `page-register.js`, `feedback.js`)
2. ~~توحيد معالجة الأخطاء~~ ✅ تم — استبدال جميع `catch {}` الفارغة بـ `console.error` مع سياق واضح (`auth-guard.js`, `core.js`, `config.js`, `page-login.js`)
3. ~~تحقق من الجلسة مع الخادم (verifySessionWithServer)~~ ✅ مؤكد — موجود في `config.js` ويُستدعى في `auth-guard.js` و`page-dashboard.js`
4. إزالة تكرار DOMContentLoaded/event listeners
5. توحيد منطق المودال في `shared.js`
6. إنشاء صفحة `account-locked.html`

## الإصلاحات المكتملة — التفاصيل:

### 1. XSS في `localStorage`
- `escapeHtml` مطبق صراحة علىText inputs` في `feedback.js` (حقول النص الحر)
- سلاسنطينrisk user inputrender)، `core.js` يمنحها إلزامياً عند الحفظ.
- باقي كافة القيم آمنة لأنها تأتي من Supabase auth أو بيانات ثابتة.

### 2. معالجة الأخطاء
- استبدال كافة `catch {}` الفارغة بـ `catch (err) { console.error(...); }`
- السياقات: `auth-guard.js`, `core.js`, `config.js`, `page-login.js`
- `handleLoginError` و `handleRegisterError` مستخدمان في كل نقاط الدخول

### 3. `verifySessionWithServer`
- أكد وجود الدالة واتصالها بـ `db.auth.getSession()`
- تعمل كتحقق فعلي من الخادم، لا تعتمد على `localStorage` فقط

## الإصلاحات المتبقية (أولوية متوسطة):
- توحيد منطق Modal
- حساب قفل الحساب
- توحيد `DOMContentLoaded`
