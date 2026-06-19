import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.100.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'http://localhost:3000',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export async function verifyCaller(supabase, authHeader) {
  if (!authHeader?.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'authorization_required' };
  }
  const token = authHeader.slice(7).trim();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return { ok: false, status: 401, error: 'invalid_token' };
  }
  const { data: profile, error: profileErr } = await supabase
    .from('users')
    .select('is_active')
    .eq('id', user.id)
    .maybeSingle();
  if (profileErr || !profile) {
    return { ok: false, status: 401, error: 'profile_not_found' };
  }
  return { ok: true, data: profile };
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

  const authHeader = req.headers.get('authorization') || '';
  const callerResult = await verifyCaller(supabase, authHeader);
  if (!callerResult.ok) return jsonResponse(callerResult.status, { error: callerResult.error });

  const caller = callerResult.data;
  if (!caller.is_active) {
    return jsonResponse(403, { error: 'forbidden' });
  }

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

  const { data: userCheck, error: userErr } = await supabase
    .from('users')
    .select('is_active')
    .eq('id', userId)
    .maybeSingle();

  if (userErr || !userCheck?.is_active) {
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
