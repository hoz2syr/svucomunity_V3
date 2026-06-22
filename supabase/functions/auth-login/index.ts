import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

const getAllowedOrigins = () =>
  (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const getClientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

const getAllowedOrigin = (origin: string | null | undefined) => {
  if (!origin) return null;
  return getAllowedOrigins().includes(origin) ? origin : null;
};

const corsHeaders = (origin: string | null | undefined) => {
  const allowedOrigin = getAllowedOrigin(origin);
  const headers = new Headers({
    "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  });

  if (allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", allowedOrigin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }

  return headers;
};

const jsonResponse = (
  body: Record<string, unknown>,
  status: number,
  origin: string | null | undefined,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...Object.fromEntries(corsHeaders(origin).entries()),
      "Content-Type": "application/json",
    },
  });

serve(async (req) => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    if (origin && !getAllowedOrigin(origin)) {
      return new Response(null, { status: 403, headers: corsHeaders(origin) });
    }
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse({ error: "Server configuration error" }, 500, origin);
  }

  const allowedOrigin = getAllowedOrigin(origin);
  if (origin && !allowedOrigin) {
    return jsonResponse({ error: "Forbidden origin" }, 403, origin);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const clientIp = getClientIp(req);

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400, origin);
  }

  const { email, password } = body;

  if (!email || !password) {
    return jsonResponse({ error: "Email and password are required" }, 400, origin);
  }

  const rateLimitKey = `login:${clientIp}`;
  const rateLimit = await supabaseAdmin.rpc('check_and_increment_rate_limit', {
    p_key: rateLimitKey,
    p_window_ms: RATE_LIMIT_WINDOW_MS,
    p_max_attempts: RATE_LIMIT_MAX_ATTEMPTS,
  });
  const allowed = (rateLimit.data?.[0]?.allowed as boolean | undefined) ?? false;
  const retryAfterMs = (rateLimit.data?.[0]?.retry_after_ms as number | undefined) ?? 0;
  if (!allowed) {
    return jsonResponse(
      { error: "Too many attempts", retryAfterMs },
      429,
      origin,
    );
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return jsonResponse(
      { error: error?.message || "Invalid credentials" },
      401,
      origin,
    );
  }

  return jsonResponse(
    {
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: data.session.user,
      },
    },
    200,
    origin,
  );
});
