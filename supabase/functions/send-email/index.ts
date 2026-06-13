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
    .select('is_admin, is_active')
    .eq('id', userId)
    .maybeSingle();

  if (callerErr || !caller) {
    return jsonResponse(401, { error: 'caller_not_found' });
  }

  if (!caller.is_admin || !caller.is_active) {
    return jsonResponse(403, { error: 'forbidden' });
  }

  const { to, subject, html, recipientsType, customEmails } = payload ?? {};

  if (!subject || !html) {
    return jsonResponse(400, { error: 'subject_and_html_required' });
  }

  let recipientList: string[] = [];

  if (recipientsType === 'all') {
    const { data: users, error: usersErr } = await supabase
      .from('users')
      .select('email')
      .eq('is_active', true);

    if (usersErr) throw usersErr;
    recipientList = (users ?? []).map((u) => u.email).filter(Boolean);
  } else if (recipientsType === 'custom' && Array.isArray(customEmails)) {
    recipientList = customEmails.filter(Boolean);
  } else if (typeof to === 'string') {
    recipientList = [to];
  } else {
    return jsonResponse(400, { error: 'invalid_recipients' });
  }

  if (recipientList.length === 0) {
    return jsonResponse(400, { error: 'no_recipients' });
  }

  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) {
    return jsonResponse(500, { error: 'email_service_not_configured' });
  }

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Deno.env.get('EMAIL_FROM') ?? 'noreply@svu-community.edu',
      to: recipientList,
      subject,
      html,
    }),
  });

  if (!emailRes.ok) {
    const errText = await emailRes.text();
    return jsonResponse(502, { error: 'resend_failed', detail: errText });
  }

  const emailData = await emailRes.json();
  return jsonResponse(200, {
    ok: true,
    sent: recipientList.length,
    messageId: emailData?.id ?? null,
  });
});
