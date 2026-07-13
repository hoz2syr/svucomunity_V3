import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;

const checkRateLimit = async (
  supabaseUrl: string,
  serviceKey: string,
  key: string,
): Promise<{ allowed: boolean; retryAfterMs: number }> => {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS);

  const { data: existing, error: fetchError } = await (await fetch(
    `${supabaseUrl}/rest/v1/rate_limits?select=count,reset_at&key=eq.${encodeURIComponent(key)}&limit=1`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    },
  )).json().then(async (r) => {
    const json = await r.json();
    return { data: json[0] ?? null, error: r.ok ? null : new Error(String(json)) };
  }).catch(() => ({ data: null, error: new Error("Rate limit fetch failed") }));

  if (fetchError) {
    console.error("Rate limit fetch error:", fetchError);
    return { allowed: true, retryAfterMs: 0 };
  }

  if (!existing || new Date(existing.reset_at) < now) {
    await fetch(`${supabaseUrl}/rest/v1/rate_limits`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify([
        { key, count: 1, reset_at: windowEnd.toISOString() },
      ]),
    });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (existing.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterMs: new Date(existing.reset_at).getTime() - now.getTime(),
    };
  }

  await fetch(
    `${supabaseUrl}/rest/v1/rate_limits?key=eq.${encodeURIComponent(key)}`,
    {
      method: "PATCH",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ count: existing.count + 1 }),
    },
  );

  return { allowed: true, retryAfterMs: 0 };
};

const getAllowedOrigins = () =>
  (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

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

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Unauthorized" }, 401, origin);
    }

    const userResponse = await fetch(
      `${supabaseUrl}/auth/v1/user`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${authHeader.replace("Bearer ", "")}`,
        },
      },
    );

    const userData = await userResponse.json();

    if (userResponse.status !== 200 || userData?.error) {
      return jsonResponse({ error: "Unauthorized" }, 401, origin);
    }

    const userId = userData.user.id;

    const { testId, rating } = await req.json();

    if (!testId || typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return jsonResponse({ error: "بيانات غير صالحة" }, 400, origin);
    }

    const rateLimitKey = `rate_test:${testId}:${userId}`;
    const rateLimit = await checkRateLimit(supabaseUrl, supabaseServiceKey, rateLimitKey);
    if (!rateLimit.allowed) {
      return jsonResponse(
        { error: "تم إرسال عدد كبير من التقييمات. يرجى المحاولة لاحقاً.", retryAfterMs: rateLimit.retryAfterMs },
        429,
        origin,
      );
    }

    const existingRatingResponse = await fetch(
      `${supabaseUrl}/rest/v1/test_ratings?select=rating&test_id=eq.${encodeURIComponent(testId)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      },
    );

    const existingRating = await existingRatingResponse.json();

    if (existingRating && existingRating.length > 0) {
      return jsonResponse({ error: "لقد قمت بتقييم هذا الاختبار مسبقاً." }, 409, origin);
    }

    const testResponse = await fetch(
      `${supabaseUrl}/rest/v1/tests?select=id,rating,rating_count&id=eq.${encodeURIComponent(testId)}&limit=1`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      },
    );

    const test = await testResponse.json();

    if (!test || test.length === 0) {
      return jsonResponse({ error: "الاختبار غير موجود" }, 404, origin);
    }

    const existingRatingValue = test[0].rating ?? null;
    const existingCount = test[0].rating_count ?? 0;
    const newCount = existingCount + 1;
    const updatedRating = Math.round(
      ((existingRatingValue ?? 0) * existingCount + rating) / newCount,
    );

    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/tests?select=rating,rating_count&id=eq.${encodeURIComponent(testId)}`,
      {
        method: "PATCH",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          rating: Math.round(
            ((test[0].rating ?? 0) * (test[0].rating_count ?? 0) + rating) /
            ((test[0].rating_count ?? 0) + 1),
          ),
          rating_count: (test[0].rating_count ?? 0) + 1,
        }),
      },
    );

    const updated = await updateResponse.json();

    if (!updateResponse.ok) {
      return jsonResponse({ error: updated?.message || "Update failed" }, 500, origin);
    }

    await fetch(`${supabaseUrl}/rest/v1/test_ratings`, {
      method: "POST",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        test_id: testId,
        user_id: userId,
        rating,
      }),
    });

    return jsonResponse({ success: true, updatedRating: updated[0]?.rating ?? updatedRating }, 200, origin);
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500, origin);
  }
});
