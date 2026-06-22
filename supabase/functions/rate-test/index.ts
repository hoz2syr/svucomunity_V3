import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;

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

const getAllowedOrigin = (origin: string | null | undefined) => {
  if (!origin) return null;
  return getAllowedOrigins().includes(origin) ? origin : null;
};

const corsHeaders = (origin: string | null | undefined) => {
  const allowedOrigin = getAllowedOrigin(origin);
  const headers = new Headers({
    "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

  const allowedOrigin = getAllowedOrigin(origin);
  if (origin && !allowedOrigin) {
    return jsonResponse({ error: "Forbidden origin" }, 403, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse({ error: "Server configuration error" }, 500, origin);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Unauthorized" }, 401, origin);
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401, origin);
    }

    const { testId, rating } = await req.json();

    if (!testId || typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return jsonResponse({ error: "بيانات غير صالحة" }, 400, origin);
    }

    const rateLimitKey = `rate_test:${testId}:${user.id}`;
    const rateLimit = await checkRateLimit(supabaseAdmin, rateLimitKey);
    if (!rateLimit.allowed) {
      return jsonResponse(
        { error: "تم إرسال عدد كبير من التقييمات. يرجى المحاولة لاحقاً.", retryAfterMs: rateLimit.retryAfterMs },
        429,
        origin,
      );
    }

    const { data: test, error: fetchError } = await supabaseAdmin
      .from("tests")
      .select("id, rating, rating_count")
      .eq("id", testId)
      .maybeSingle();

    if (fetchError || !test) {
      return jsonResponse({ error: "الاختبار غير موجود" }, 404, origin);
    }

    const existingRating = test.rating ?? null;
    const existingCount = test.rating_count ?? 0;
    const newCount = existingCount + 1;
    const updatedRating = Math.round(
      ((existingRating ?? 0) * existingCount + rating) / newCount,
    );

    const { error: updateError } = await supabaseAdmin
      .from("tests")
      .update({ rating: updatedRating, rating_count: newCount })
      .eq("id", testId);

    if (updateError) {
      return jsonResponse({ error: updateError.message }, 500, origin);
    }

    return jsonResponse({ success: true, updatedRating }, 200, origin);
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500, origin);
  }
});
