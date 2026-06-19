import { supabase, supabaseUrl } from '@svu-community/supabase-client';

const ADMIN_ACTIONS_URL = `${supabaseUrl}/functions/v1/admin-actions`;

type AdminAction = {
  action: string;
  payload?: Record<string, unknown>;
};

export async function invokeAdminAction({ action, payload }: AdminAction): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return { ok: false, error: 'not_authenticated' };
  }

  const res = await fetch(ADMIN_ACTIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action, payload }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: body.error ?? `request_failed_${res.status}` };
  }

  return { ok: true, data: body };
}
