import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

const getClientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

const corsHeaders = () =>
  new Headers({
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
  });

const jsonResponse = (
  body: Record<string, unknown>,
  status: number,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...Object.fromEntries(corsHeaders().entries()),
      "Content-Type": "application/json",
    },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse({ error: "Server configuration error" }, 500);
  }

  let body: { key?: string; windowMs?: number; maxAttempts?: number };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const key = body.key;
  const windowMs = body.windowMs ?? RATE_LIMIT_WINDOW_MS;
  const maxAttempts = body.maxAttempts ?? RATE_LIMIT_MAX_ATTEMPTS;

  if (!key || typeof key !== "string") {
    return jsonResponse({ error: "Missing required field: key" }, 400);
  }

  const clientIp = getClientIp(req);
  const rateLimitKey = `${key}:${clientIp}`;

  try {
    const { data, error } = await (await fetch(
      `${supabaseUrl}/rest/v1/rpc/check_and_increment_rate_limit`,
      {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_key: rateLimitKey,
          p_window_ms: windowMs,
          p_max_attempts: maxAttempts,
        }),
      },
    )).json();

    if (error) {
      return jsonResponse({ error: "Rate limit check failed" }, 500);
    }

    const result = data?.[0] ?? { allowed: true, retry_after_ms: 0 };

    return jsonResponse(
      {
        allowed: result.allowed ?? true,
        retryAfterMs: result.retry_after_ms ?? 0,
      },
      result.allowed ? 200 : 429,
    );
  } catch {
    return jsonResponse({ error: "Rate limit service unavailable" }, 500);
  }
});
