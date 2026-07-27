import { hasSupabaseEnv, getSupabaseClient } from '@/src/lib/supabase';

export async function logAdminAction(
  callerId: string,
  action: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!hasSupabaseEnv()) return;
  const client = await getSupabaseClient();

  let ipAddress = 'unknown';
  let userAgent = 'unknown';

  try {
    if (typeof window !== 'undefined') {
      userAgent = navigator.userAgent;
      const ipResponse = await fetch('/api/ip');
      if (ipResponse.ok) {
        const ipData = (await ipResponse.json()) as { ip: string };
        ipAddress = ipData.ip;
      }
    }
  } catch {
    // keep fallback values
  }

  try {
    await client.from('admin_audit_log').insert({
      caller_id: callerId,
      action,
      payload,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch {
    // audit log failure must not break the original operation
  }
}
