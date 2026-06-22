import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const RATE_LIMIT_WINDOW_MS = 120_000;
const RATE_LIMIT_MAX_ATTEMPTS = 3;

const checkRateLimit = async (
  supabaseAdmin: SupabaseClient,
  key: string,
): Promise<{ allowed: boolean; retryAfterMs: number }> => {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS);

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("rate_limits")
    .select("count, reset_at")
    .eq("key", key)
    .maybeSingle();

  if (fetchError) {
    console.error("Rate limit fetch error:", fetchError);
    return { allowed: true, retryAfterMs: 0 };
  }

  if (!existing || new Date(existing.reset_at) < now) {
    await supabaseAdmin.from("rate_limits").upsert(
      { key, count: 1, reset_at: windowEnd.toISOString() },
      { onConflict: "key" },
    );
    return { allowed: true, retryAfterMs: 0 };
  }

  if (existing.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterMs: new Date(existing.reset_at).getTime() - now.getTime(),
    };
  }

  await supabaseAdmin
    .from("rate_limits")
    .update({ count: existing.count + 1 })
    .eq("key", key);

  return { allowed: true, retryAfterMs: 0 };
};

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

  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400, origin);
  }

  const { name, email, password } = body;

  if (!name || !email || !password) {
    return jsonResponse({ error: "Name, email and password are required" }, 400, origin);
  }

  if (password.length < 8) {
    return jsonResponse({ error: "Password must be at least 8 characters" }, 400, origin);
  }

  const rateLimitKey = `register:${clientIp}`;
  const rateLimit = await checkRateLimit(supabaseAdmin, rateLimitKey);
  if (!rateLimit.allowed) {
    return jsonResponse(
      { error: "Too many attempts", retryAfterMs: rateLimit.retryAfterMs },
      429,
      origin,
    );
  }

  const { data, error } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  });

  if (error) {
    return jsonResponse({ error: error.message }, 400, origin);
  }

  return jsonResponse(
    {
      data: {
        user: data.user,
        session: data.session ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        } : null,
      },
    },
    200,
    origin,
  );
});
