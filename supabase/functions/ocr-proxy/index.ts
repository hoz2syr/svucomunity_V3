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

async function callVisionApi(imageBase64: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vision API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const annotation = data?.responses?.[0]?.fullTextAnnotation;
  if (!annotation) return '';
  return annotation.text;
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

  const { imageBase64, mimeType } = payload ?? {};

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return jsonResponse(400, { error: 'imageBase64_required' });
  }

  const dataUriMatch = imageBase64.match(/^data:(?<mime>[^;]+);base64,(?<data>.+)$/);
  const base64Data = dataUriMatch ? dataUriMatch.groups!.data : imageBase64;
  const resolvedMime = dataUriMatch?.groups?.mime ?? mimeType ?? 'image/jpeg';

  const googleKey = Deno.env.get('GOOGLE_API_KEY') ?? Deno.env.get('GOOGLE_VISION_API_KEY');
  if (!googleKey) {
    return jsonResponse(500, { error: 'vision_service_not_configured' });
  }

  try {
    const text = await callVisionApi(base64Data, googleKey);
    return jsonResponse(200, { ok: true, text, mimeType: resolvedMime });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonResponse(502, { error: 'vision_failed', detail: message });
  }
});
