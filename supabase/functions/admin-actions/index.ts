import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

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

  const { action, payload: args, caller_id } = payload;
  if (!action || typeof action !== 'string') {
    return jsonResponse(400, { error: 'missing_action' });
  }

  const validActions = ['makeAdmin', 'revokeAdmin', 'toggleActive', 'deleteGroup', 'sendEmail'];
  if (!validActions.includes(action)) {
    return jsonResponse(400, { error: 'unsupported_action', action });
  }

  const callerId = caller_id ?? (req.headers.get('x-caller-id') ?? null);
  if (!callerId) {
    return jsonResponse(401, { error: 'caller_id_required' });
  }

  const { data: caller, error: callerErr } = await supabase
    .from('users')
    .select('id, is_admin, is_active')
    .eq('id', callerId)
    .maybeSingle();

  if (callerErr || !caller) {
    return jsonResponse(401, { error: 'caller_not_found' });
  }

  if (!caller.is_admin) {
    return jsonResponse(403, { error: 'forbidden' });
  }

  if (!caller.is_active) {
    return jsonResponse(403, { error: 'caller_inactive' });
  }

  try {
    switch (action) {
      case 'makeAdmin': {
        const { userId } = args ?? {};
        if (!userId) return jsonResponse(400, { error: 'userId_required' });
        const { error } = await supabase
          .from('users')
          .update({ is_admin: true })
          .eq('id', userId);
        if (error) throw error;
        return jsonResponse(200, { ok: true });
      }

      case 'revokeAdmin': {
        const { userId } = args ?? {};
        if (!userId) return jsonResponse(400, { error: 'userId_required' });
        if (callerId === userId) {
          return jsonResponse(400, { error: 'cannot_revoke_self' });
        }
        const { error } = await supabase
          .from('users')
          .update({ is_admin: false })
          .eq('id', userId);
        if (error) throw error;
        return jsonResponse(200, { ok: true });
      }

      case 'toggleActive': {
        const { userId, active } = args ?? {};
        if (!userId || typeof active !== 'boolean') {
          return jsonResponse(400, { error: 'userId_and_active_required' });
        }
        if (callerId === userId && !active) {
          return jsonResponse(400, { error: 'cannot_deactivate_self' });
        }
        const { error } = await supabase
          .from('users')
          .update({ is_active: active })
          .eq('id', userId);
        if (error) throw error;
        return jsonResponse(200, { ok: true });
      }

      case 'deleteGroup': {
        const { groupId } = args ?? {};
        if (!groupId) return jsonResponse(400, { error: 'groupId_required' });
        const { error: membersErr } = await supabase
          .from('group_members')
          .delete()
          .eq('group_id', groupId);
        if (membersErr) throw membersErr;
        const { error: groupErr } = await supabase
          .from('groups')
          .delete()
          .eq('id', groupId);
        if (groupErr) throw groupErr;
        return jsonResponse(200, { ok: true });
      }

      case 'sendEmail': {
        const { recipientsType, subject, body, customEmails } = args ?? {};
        if (!subject || !body) {
          return jsonResponse(400, { error: 'subject_and_body_required' });
        }

        let recipientList = [];
        if (recipientsType === 'all') {
          const { data: users, error: usersErr } = await supabase
            .from('users')
            .select('email')
            .eq('is_active', true);
          if (usersErr) throw usersErr;
          recipientList = (users ?? []).map((u) => u.email).filter(Boolean);
        } else if (recipientsType === 'custom') {
          recipientList = (customEmails ?? '')
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean);
        } else {
          return jsonResponse(400, { error: 'invalid_recipients_type' });
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
            html: body,
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
          failed: 0,
          messageId: emailData?.id ?? null,
        });
      }

      default:
        return jsonResponse(400, { error: 'unsupported_action', action });
    }
  } catch (e) {
    return jsonResponse(500, { error: 'internal_error', detail: e?.message ?? String(e) });
  }
});
