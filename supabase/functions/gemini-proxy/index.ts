import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.100.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  let payload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return jsonResponse(401, { error: 'caller_id_required' });
  }

  const { data: caller, error: callerErr } = await supabase
    .from('users')
    .select('is_active')
    .eq('id', userId)
    .maybeSingle();

  if (callerErr || !caller?.is_active) {
    return jsonResponse(403, { error: 'forbidden' });
  }

  const { prompt } = payload ?? {};
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return jsonResponse(400, { error: 'prompt_required' });
  }

  const geminiKey = Deno.env.get('GOOGLE_API_KEY') ?? Deno.env.get('GEMINI_API_KEY');
  if (!geminiKey) {
    return jsonResponse(500, { error: 'gemini_service_not_configured' });
  }

  try {
    const reply = await callGemini(prompt.trim(), geminiKey);
    return jsonResponse(200, { ok: true, reply });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonResponse(502, { error: 'gemini_failed', detail: message });
  }
});
