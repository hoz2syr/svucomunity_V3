export async function withAuth<T>(fn: () => Promise<T>): Promise<T> {
  const { supabase } = await import('./index.js');
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Unauthorized');
  return fn();
}
