import { getErrorMessage as readErrorMessage, hasSupabaseEnv as readSupabaseEnv, missingSupabaseEnvMessage as supabaseMissingEnvMessage } from '../lib/supabase';

export const missingSupabaseEnvMessage = supabaseMissingEnvMessage;

export const hasSupabaseEnv = (): boolean => readSupabaseEnv();

export const getErrorMessage = readErrorMessage;
