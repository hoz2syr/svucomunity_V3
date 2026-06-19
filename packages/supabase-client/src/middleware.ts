import { supabase } from './index';

export async function withAuth<T>(fn: () => Promise<T>): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Unauthorized');
  return fn();
}
