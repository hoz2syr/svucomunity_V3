import { getErrorMessage, getSupabaseClient, hasSupabaseEnv, missingSupabaseEnvMessage, upsertProfile } from '../lib/supabase';
import type { Profile } from '../types/profile';
import type { SupabaseOperationError } from '../types/supabase';

export { upsertProfile };

export type RefreshProfileResult = {
  data: Profile | null;
  error: SupabaseOperationError | null;
};

export type UpdateProfileResult = {
  data: null;
  error: SupabaseOperationError | null;
};

export type UpdatePasswordResult = {
  data: null;
  error: SupabaseOperationError | null;
};

const createMissingEnvError = (): SupabaseOperationError => ({
  message: missingSupabaseEnvMessage,
});

const toSupabaseError = (error: unknown): SupabaseOperationError => ({
  message: getErrorMessage(error),
});

export const refreshProfile = async (userId: string): Promise<RefreshProfileResult> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: createMissingEnvError() };
  }

  try {
    const client = getSupabaseClient();
    const { data: { user } } = await client.auth.getUser();

    if (!user || user.id !== userId) {
      return { data: null, error: { message: 'غير مصرح به.' } };
    }

    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return { data: null, error: error ?? { message: 'تعذر قراءة الملف الشخصي.' } };
    }

    return { data: data as Profile, error: null };
  } catch (error) {
    return { data: null, error: toSupabaseError(error) };
  }
};

export const updateProfile = async (userId: string, full_name: string, username: string): Promise<UpdateProfileResult> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: createMissingEnvError() };
  }

  try {
    const client = getSupabaseClient();
    const { data: { user } } = await client.auth.getUser();

    if (!user || user.id !== userId) {
      return { data: null, error: { message: 'غير مصرح به.' } };
    }

    const { error } = await client
      .from('profiles')
      .update({ full_name, username })
      .eq('id', userId);

    return { data: null, error };
  } catch (error) {
    return { data: null, error: toSupabaseError(error) };
  }
};

export const updatePassword = async (email: string, currentPassword: string, newPassword: string): Promise<UpdatePasswordResult> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: createMissingEnvError() };
  }

  try {
    const client = getSupabaseClient();
    const { data: { user } } = await client.auth.getUser();

    if (!user) {
      return { data: null, error: { message: 'غير مصرح به.' } };
    }

    if (user.email !== email) {
      return { data: null, error: { message: 'البريد الإلكتروني لا يطابق المستخدم الحالي.' } };
    }

    const { error: signInError } = await client.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      return { data: null, error: signInError };
    }

    const { error: updateError } = await client.auth.updateUser({
      password: newPassword,
    });

    return { data: null, error: updateError };
  } catch (error) {
    return { data: null, error: toSupabaseError(error) };
  }
};
