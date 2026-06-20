Deno Test Suite for `delete-account` Edge Function
===================================================

These tests run with the **Deno runtime**, not Vitest. They verify the
server-side logic directly (CORS, rate limiting, admin rejection, profile
and auth deletion, audit logging).

Prerequisites
-------------
- Deno >= 1.41:
    https://docs.deno.com/runtime/getting_started/installation

Quick run
---------
From the repo root:

    deno task test

You can also specify a single file:

    deno test --filter "DeleteAccountEdgeFunction" supabase/functions/delete-account

Environment
-----------
Set the following env vars (do NOT hard-code real secrets):

    export SUPABASE_URL="https://your-project.supabase.co"
    export SUPABASE_SERVICE_ROLE_KEY="eyJ..."

Notes
-----
- CORS origin checks require the HTTP request `Origin` header to match
  `ALLOWED_ORIGINS` (comma-separated). Use a value like
  `http://localhost:5173` during development.
- The `rate_limits` table must exist (migration `005_security_hardening.sql`).
