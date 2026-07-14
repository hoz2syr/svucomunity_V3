import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

const corsHeaders = (origin: string | null) => {
  const headers = new Headers({
    "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
  });
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  return headers;
};

serve(async (req) => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("MISTRAL_API_KEY");
  if (!apiKey) {
    console.error('[mistral-chat] MISTRAL_API_KEY is not configured');
    return new Response(JSON.stringify({ error: "MISTRAL_API_KEY_NOT_CONFIGURED" }), {
      status: 500,
      headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "INVALID_MESSAGE" }), {
        status: 400,
        headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
      });
    }

    const mistralResponse = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: "أنت مساعد ذكي. رد باختصار ووضوح.",
          },
          {
            role: "user",
            content: message.trim(),
          },
        ],
        max_tokens: 512,
      }),
    });

    if (!mistralResponse.ok) {
      const errorText = await mistralResponse.text();
      console.error('[mistral-chat] Mistral API error:', mistralResponse.status, errorText);
      return new Response(JSON.stringify({ error: `MISTRAL_API_ERROR: ${mistralResponse.status}` }), {
        status: 502,
        headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
      });
    }

    const data = await mistralResponse.json();
    const reply = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "MISTRAL_NETWORK_ERROR";
    console.error('[mistral-chat] Unexpected error:', err);
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
    });
  }
});
