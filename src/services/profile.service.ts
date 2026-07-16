import { createMissingEnvError, getErrorMessage, getSupabaseClient, hasSupabaseEnv } from '../lib/supabase';
import type { Profile } from '../types/profile';
import type { SupabaseOperationError } from '../types/supabase';

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

const toSupabaseError = (error: unknown): SupabaseOperationError => ({
  message: getErrorMessage(error),
});

export const refreshProfile = async (userId: string): Promise<RefreshProfileResult> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: createMissingEnvError() };
  }

  try {
    const client = await getSupabaseClient();
    const { data: { user } } = await client.auth.getUser();

    if (!user || user.id !== userId) {
      return { data: null, error: { message: 'غير مصرح به.' } };
    }

    const { data, error } = await client
      .from('profiles')
      .select('id, full_name, avatar_url, phone, major, current_semester, role, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      return { data: null, error: error };
    }

    if (!data) {
      return { data: null, error: null };
    }

    return { data: data as Profile, error: null };
  } catch (error) {
    return { data: null, error: toSupabaseError(error) };
  }
};

export const updateProfile = async (userId: string, full_name: string, username: string, major?: string, current_semester?: string): Promise<UpdateProfileResult> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: createMissingEnvError() };
  }

  try {
    const client = await getSupabaseClient();
    const { data: { user } } = await client.auth.getUser();

    if (!user || user.id !== userId) {
      return { data: null, error: { message: 'غير مصرح به.' } };
    }

    const updateData: Record<string, unknown> = { full_name, username };
    if (major !== undefined) {
      updateData.major = major;
    }
    if (current_semester !== undefined) {
      updateData.current_semester = current_semester;
    }

    const { error } = await client
      .from('profiles')
      .update(updateData)
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
    const client = await getSupabaseClient();
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
