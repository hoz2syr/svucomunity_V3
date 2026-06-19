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

async function verifyCaller(supabase, authHeader) {
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
    .select('id, is_admin, is_active')
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
  if (!caller.is_admin || !caller.is_active) {
    return jsonResponse(403, { error: 'forbidden' });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const { action, payload: args } = payload ?? {};
  if (!action || typeof action !== 'string') {
    return jsonResponse(400, { error: 'missing_action' });
  }

  const validActions = [
    'makeAdmin', 'revokeAdmin', 'toggleActive', 'deleteGroup',
    'sendEmail', 'createCourse', 'deleteCourse', 'saveSettings', 'resetAllData',
    'deleteSelf'
  ];
  if (!validActions.includes(action)) {
    return jsonResponse(400, { error: 'unsupported_action', action });
  }

  await supabase.from('admin_audit_log').insert({
    caller_id: caller.id,
    action,
    payload: args ?? {},
    ip_address: req.headers.get('x-forwarded-for') || 'unknown',
    user_agent: req.headers.get('user-agent') || 'unknown',
    created_at: new Date().toISOString(),
  }).then(({ error: auditErr }) => {
    if (auditErr) console.warn('[audit] failed:', auditErr);
  });

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
        if (caller.id === userId) {
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
        if (caller.id === userId && !active) {
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
        const { error: groupErr } = await supabase
          .from('study_groups')
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
            subject: subject.trim(),
            html: body.trim(),
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

      case 'createCourse': {
        const { courseData } = args ?? {};
        if (!courseData?.name || !courseData?.code) {
          return jsonResponse(400, { error: 'course_name_and_code_required' });
        }
        const { error } = await supabase
          .from('courses')
          .insert({
            name: courseData.name,
            code: courseData.code,
            major: courseData.major ?? null,
            instructor: courseData.instructor ?? null,
            max_members: courseData.max_members ?? null,
            description: courseData.description ?? null,
          });
        if (error) throw error;
        return jsonResponse(200, { ok: true });
      }

      case 'deleteCourse': {
        const { courseId } = args ?? {};
        if (!courseId) return jsonResponse(400, { error: 'courseId_required' });
        const { error } = await supabase
          .from('courses')
          .delete()
          .eq('id', courseId);
        if (error) throw error;
        return jsonResponse(200, { ok: true });
      }

      case 'saveSettings': {
        const { siteName, defaultLang, requireEmail, allowRegistration } = args ?? {};
        const settingsRow = {
          site_name: siteName ?? 'SVU Community',
          default_lang: defaultLang ?? 'ar',
          require_email: typeof requireEmail === 'boolean' ? requireEmail : true,
          allow_registration: typeof allowRegistration === 'boolean' ? allowRegistration : true,
          updated_at: new Date().toISOString(),
        };
        const { data: existing } = await supabase
          .from('settings')
          .select('key')
          .eq('key', 'app_config')
          .maybeSingle();
        if (existing) {
          const { error: updateErr } = await supabase
            .from('settings')
            .update({ value: settingsRow })
            .eq('key', 'app_config');
          if (updateErr) throw updateErr;
        } else {
          const { error: insertErr } = await supabase
            .from('settings')
            .insert({ key: 'app_config', value: settingsRow });
          if (insertErr) throw insertErr;
        }
        return jsonResponse(200, { ok: true });
      }

      case 'resetAllData': {
        const { error: groupsErr } = await supabase
          .from('study_groups')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
        if (groupsErr) throw groupsErr;
        const { error: coursesErr } = await supabase
          .from('courses')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
        if (coursesErr) throw coursesErr;
        return jsonResponse(200, { ok: true });
      }

      case 'deleteSelf': {
        const targetUserId = (args?.userId as string) ?? caller.id;
        if (targetUserId !== caller.id) {
          return jsonResponse(403, { error: 'cannot_delete_other_user' });
        }
        const { error: profileErr } = await supabase
          .from('profiles')
          .delete()
          .eq('id', caller.id);
        if (profileErr) throw profileErr;
        const { error: authErr } = await supabase.auth.admin.deleteUser(caller.id);
        if (authErr) throw authErr;
        return jsonResponse(200, { ok: true });
      }

      default:
        return jsonResponse(400, { error: 'unsupported_action', action });
    }
  } catch (e) {
    return jsonResponse(500, { error: 'internal_error', detail: e?.message ?? String(e) });
  }
});
