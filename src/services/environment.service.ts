import { getErrorMessage as readErrorMessage, hasSupabaseEnv as readSupabaseEnv, missingSupabaseEnvMessage as supabaseMissingEnvMessage, refreshCurrentSession, getCurrentSession } from '../lib/supabase';

export const missingSupabaseEnvMessage = supabaseMissingEnvMessage;

export const hasSupabaseEnv = (): boolean => readSupabaseEnv();

export const getErrorMessage = readErrorMessage;

export const refreshSession = refreshCurrentSession;
export const getSession = getCurrentSession;
