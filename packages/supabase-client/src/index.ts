import { createClient } from '@supabase/supabase-js';
import type { User } from '@svu-community/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function isAdmin(user: User | null): boolean {
  return user?.is_admin ?? false;
}
