import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  const headers = new Headers({
    "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  });

  const allowedOrigin = getAllowedOrigin(origin);
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

const isAdminUser = async (supabaseAdmin: SupabaseClient, userId: string): Promise<boolean> => {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role === "admin";
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

  const tempAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const rateLimit = await tempAdminClient.rpc('check_and_increment_rate_limit', {
    p_key: rateLimitKey,
    p_window_ms: RATE_LIMIT_WINDOW_MS,
    p_max_attempts: RATE_LIMIT_MAX_ATTEMPTS,
  });
  const allowed = (rateLimit.data?.[0]?.allowed as boolean | undefined) ?? false;
  if (!allowed) {
    return jsonResponse({ error: "Too many requests" }, 429, origin);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const { data, error: authError } = await supabaseAdmin.auth.getUser(jwt);
  if (authError || !data.user) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  const admin = await isAdminUser(supabaseAdmin, data.user.id);

  if (admin) {
    return jsonResponse({ error: "Forbidden" }, 403, origin);
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", data.user.id);

  if (profileError) {
    return jsonResponse({ error: "Profile deletion failed" }, 500, origin);
  }

  const { error: adminError } = await supabaseAdmin.auth.admin.deleteUser(data.user.id);
  if (adminError) {
    return jsonResponse({ error: "Account deletion failed" }, 500, origin);
  }

  const { error: auditError } = await supabaseAdmin
    .from("admin_audit_log")
    .insert({
      caller_id: data.user.id,
      action: "delete_account",
      payload: {
        auth_provider: data.user.app_metadata?.provider ?? "unknown",
        ip_address: clientIp,
        user_agent: req.headers.get("user-agent") ?? "unknown",
      },
      ip_address: clientIp,
      user_agent: req.headers.get("user-agent") ?? "unknown",
    });

  if (auditError) {
    console.error("Audit log insert failed:", auditError);
  }

  return jsonResponse({ ok: true }, 200, origin);
});
