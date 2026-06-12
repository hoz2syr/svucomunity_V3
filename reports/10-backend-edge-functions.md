# Backend Audit Report — Edge Functions & API Layer

**Date:** 2026-06-12  
**Scope:** supabase/functions/, apps/schedule/src/services/gemini.ts, apps/schedule/src/services/types.ts

---

## Critical Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 1 | `supabase/functions/send-email/index.ts` | — | **File is empty (0 bytes)** — function not implemented | Edge Function scaffolded but never written | Implement with request validation, service_role key from env, Resend API call, and CORS headers |
| 2 | `supabase/functions/ocr-proxy/index.ts` | — | **File is empty** — function not implemented | Same | Implement with image validation, Google Vision API via secrets, CORS headers |
| 3 | `supabase/functions/gemini-proxy/index.ts` | — | **File is empty** — function not implemented | Same | Implement with body validation, `GOOGLE_API_KEY` from secrets, Gemini 2.0 Flash Lite call, CORS headers |
| 4 | `.env.example` | 5 | `VITE_GEMINI_API_KEY` — Gemini key exposed as **client-side** env var | Vite-prefixed vars bundled into client build | Remove `VITE_GEMINI_API_KEY`; store only as Supabase secret (`GOOGLE_API_KEY`) |
| 5 | `.env.example` | 6 | `VITE_RESEND_API_KEY` — Resend key exposed as **client-side** env var | Same | Remove `VITE_RESEND_API_KEY`; store as Supabase secret (`RESEND_API_KEY`) |

## High Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 6 | `supabase/config.toml` | — | **Config is empty** — no auth section, no functions section, no CORS | Config never committed/initialized | Add `[auth]`, `[functions.*]` sections with proper CORS and timeouts |
| 7 | `packages/supabase-client/src/index.ts` | 7 | Browser client created **without auth config** — no `persistSession` or `autoRefreshToken` | Missing from shared client setup | Add `{ auth: { persistSession: true, autoRefreshToken: true } }` to match `apps/schedule/src/services/supabase.ts:19-23` |
| 8 | `apps/schedule/src/services/types.ts` | 7–13 | `Course` fields all `string | undefined` — loses structured data from Gemini (credits, grade, semester) | Types designed for display only, not AI output parity | Add optional numeric/text fields if Edge Function returns them |

## Medium Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 9 | `.env.example` | 7 | `SUPABASE_SERVICE_ROLE_KEY` listed without `VITE_` prefix in client-shared file — confusing; suggests it might be consumed by app | Mixed server/client env template | Move to server-only `.env.supabase` or Supabase secrets; add comment that it is for Edge Functions only |
| 10 | `apps/schedule/src/hooks/useStudyGroups.ts` | 2 | Import sources split: `useSchedule.ts` uses `@svu-community/supabase-client`, `useStudyGroups.ts` uses `../services/supabase` | Two Supabase client files with different configs | Consolidate to single source — delete local `src/services/supabase.ts`, import from `@svu-community/supabase-client` |
| 11 | `apps/schedule/src/hooks/useGroupActions.ts` | 2 | Same split-source problem as #10 | Same root cause | Same fix — consolidate |

## Low Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 12 | `gemini-proxy/package.json` | — | Empty file — no dependencies declared | Scaffolded but never populated | Add `"@google/genai": "^1.x"` |
| 13 | `send-email/package.json` | — | Empty file | Same | Add `"resend": "^4.x"` |
| 14 | `ocr-proxy/package.json` | — | Empty file | Same | Add `"@google-cloud/vision": "^4.x"` |
| 15 | `packages/supabase-client/src/client.ts` | 3–4 | Zero-value fallback (`|| ''`) silently produces invalid empty-string URL/key | Inconsistent error handling vs `index.ts` | Remove the `|| ''` fallbacks so missing-config error is thrown early |

## Recommendations

1. **Implement all three Edge Functions immediately** using the headers as specs
2. **Fix `.env.example`** — remove `VITE_GEMINI_API_KEY` and `VITE_RESEND_API_KEY`
3. **Populate `supabase/config.toml`** with auth redirect URLs and CORS allowlist
4. **Unify Supabase client** — delete `apps/schedule/src/services/supabase.ts`, import only from `@svu-community/supabase-client`
5. **Add timeout enforcement** in all Edge Functions via `max_duration` in config.toml or `AbortController.timeout()`
6. **Add a response envelope** across all functions for consistent error handling
