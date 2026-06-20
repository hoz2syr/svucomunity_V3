# بنية Supabase — تقسيم المسؤوليات

## نظرة عامة

Supabase هو **طبقة الخادم** في مشروع SVU Community. يتولى:
- المصادقة (Auth)
- قاعدة البيانات (PostgreSQL + RLS)
- Edge Functions للمنطق الحساس

الواجهة الأمامية (React/Vite في `src/`) تتولى:
- عرض المكونات
- التحقق من المدخلات ( zod )
- إدارة الحالة ( Zustand + React Query )
- توجيه المستخدم ( React Router )

---

## ما في Supabase (`supabase/`)

| الملف/المجلد | المسؤولية |
|---|---|
| `migrations/` | تchangements هيكلية قاعدة البيانات (Schema) |
| `functions/` | منطق الخادم الحر (delete-account) |
| `seed/` | بيانات تجريبية للتطوير |
| `config.toml` | إعدادات المشروع (Auth, API, Functions) |

### الجداول (طبقة البيانات)
- `public.profiles` — بيانات المستخدمين
- `public.notifications` — إشعارات المستخدمين
- `public.admin_audit_log` — سجل العمليات الحساسة

---

## ما في `src/` (الواجهة الأمامية)

| المجلد | المسؤولية | Supabase |
|---|---|---|
| `src/lib/supabase.ts` | تهيئة العميل، `upsertProfile`، `signInWithGoogle`، `deleteOwnAccount` | يقرأ `VITE_SUPABASE_URL` + `ANON_KEY` |
| `src/services/auth.service.ts` | `loginWithPassword`، `registerWithEmail`، `resetPassword`، `completeAuthCallback`، `listenAuthChanges` | يستدعي `supabase.auth.*` ويستدعي `libHandleAuthCallback` من lib |
| `src/services/profile.service.ts` | refresh، update profile | يستدعي `supabase.from('profiles')` |
| `src/services/notification.service.ts` | fetch notifications | يستدعي `supabase.from('notifications')` |
| `src/contexts/AuthContext.tsx` | إدارة حالة الجلسة (session) | يقرأ `supabase.auth.getSession()` |
| `src/components/ProtectedRoute.tsx` | حماية المسارات | يتحقق من `session` |
| `src/hooks/useAuthForm.ts` | validation Zod | لا يتصل بـ Supabase مباشرة |
| `src/hooks/useRateLimit.ts` | تقييد المحاولات محلياً | `localStorage` |

---

## الفصل بين المسؤوليات

```
┌───────────────────────────────────────────────────────────────────┐
│                        Supabase                                       │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐   │
│  │    Auth      │  │  PostgreSQL   │  │   Edge Functions     │   │
│  │ (supabase.js) │  │  (RLS)        │  │   (Deno runtime)     │   │
│  └──────┬───────┘  └───────┬───────┘  └──────────┬───────────┘   │
│         │                  │                     │                  │
│         └──────────────────┼─────────────────────┘                  │
│                            │                                        │
│           RLS يتحقق من كل عملية قراءة/كتابة                        │
└────────────────────────────┼────────────────────────────────────────┘
                             │
                             │ REST / Realtime
                             ▼
┌───────────────────────────────────────────────────────────────────┐
│                     React Frontend (src/)                            │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │   Pages    │  │  Components  │  │       Services           │   │
│  │  (Router)  │  │  (UI)        │  │  (supabase API calls)    │   │
│  └────────────┘  └──────────────┘  └──────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

---

## نقاط التحكم الأمنية

| الطبقة | الآلية |
|---|---|
| قاعدة البيانات | RLS Policies |
| Edge Function | `service_role` key + JWT validation + Rate Limit + Origin check |
| العميل | Zod validation + ProtectedRoute + useRateLimit |

---

## ما لا يوجد (حتى الآن)

| البند | الحاجة |
|---|---|
| Realtime subscriptions | لا توجد subscriptions فعلية |
| Storage (ملفات/images) | غير مستخدم |
| Edge Functions إضافية | فقط `delete-account` |
| Webhooks | غير موجود |
| Row-level triggers | غير موجود (ما عدا upsertProfile في Edge Function) |
