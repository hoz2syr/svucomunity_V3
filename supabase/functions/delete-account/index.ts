import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 3;

const getAllowedOrigins = () =>
  (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const getClientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

const getAllowedOrigin = (origin: string | null | undefined) => {
  if (!origin) return null;
  const whitelist = getAllowedOrigins();
  if (whitelist.includes(origin)) return origin;
  if (origin.endsWith('.pages.dev')) return origin;
  return null;
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

const supabaseRest = async (
  supabaseUrl: string,
  supabaseServiceKey: string,
  path: string,
  init: RequestInit = {},
) => {
  const url = `${supabaseUrl}/rest/v1/${path}`;
  const headers = new Headers({
    apikey: supabaseServiceKey,
    Authorization: `Bearer ${supabaseServiceKey}`,
    "Content-Type": "application/json",
    ...Object.fromEntries(new Headers(init.headers || {}).entries()),
  });
  return fetch(url, { ...init, headers });
};

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

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  const jwt = authHeader.slice("Bearer ".length);
  const clientIp = getClientIp(req);
  const rateLimitKey = `${clientIp}:${jwt.slice(0, 16)}`;

  const rateLimitResponse = await supabaseRest(
    supabaseUrl,
    supabaseServiceKey,
    "rpc/check_and_increment_rate_limit",
    {
      method: "POST",
      body: JSON.stringify({
        p_key: rateLimitKey,
        p_window_ms: RATE_LIMIT_WINDOW_MS,
        p_max_attempts: RATE_LIMIT_MAX_ATTEMPTS,
      }),
    },
  );

  let rateLimitData: { allowed?: boolean; retry_after_ms?: number } = {};
  try {
    rateLimitData = (await rateLimitResponse.json())[0] ?? {};
  } catch {
    rateLimitData = {};
  }

  const allowed = (rateLimitData.allowed as boolean | undefined) ?? false;
  if (!allowed) {
    return jsonResponse({ error: "Too many requests" }, 429, origin);
  }

  const userResponse = await fetch(
    `${supabaseUrl}/auth/v1/user`,
    {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${jwt}`,
      },
    },
  );

  const userData = await userResponse.json();

  if (userResponse.status !== 200 || userData?.error) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  const userId = userData.user.id;

  const profileResponse = await supabaseRest(
    supabaseUrl,
    supabaseServiceKey,
    `profiles?select=role&id=eq.${encodeURIComponent(userId)}`,
  );

  const profileData = await profileResponse.json();
  const isAdmin = profileData?.[0]?.role === "admin";

  if (isAdmin) {
    return jsonResponse({ error: "Forbidden" }, 403, origin);
  }

  await supabaseRest(
    supabaseUrl,
    supabaseServiceKey,
    `profiles?id=eq.${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );

  const deleteUserResponse = await fetch(
    `${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    },
  );

  if (deleteUserResponse.status !== 204) {
    const deleteData = await deleteUserResponse.json().catch(() => ({}));
    return jsonResponse(
      { error: deleteData?.message || "Account deletion failed" },
      500,
      origin,
    );
  }

  await supabaseRest(
    supabaseUrl,
    supabaseServiceKey,
    `admin_audit_log`,
    {
      method: "POST",
      body: JSON.stringify({
        caller_id: userId,
        action: "delete_account",
        payload: {
          auth_provider: userData.user.app_metadata?.provider ?? "unknown",
          ip_address: clientIp,
          user_agent: req.headers.get("user-agent") ?? "unknown",
        },
        ip_address: clientIp,
        user_agent: req.headers.get("user-agent") ?? "unknown",
      }),
    },
  );

  return jsonResponse({ ok: true }, 200, origin);
});
