import { z } from 'zod';
import type { DeleteAccountInput, LoginInput, ProfileInput, RegisterInput, SecurityInput } from '../types/auth';

export const loginSchema: z.ZodType<LoginInput> = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('صيغة البريد غير صحيحة').max(255),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل').max(128),
}) as z.ZodType<LoginInput>;

export const registerSchema: z.ZodType<RegisterInput> = z.object({
  name: z
    .string()
    .min(1, 'الاسم مطلوب')
    .min(2, 'الاسم قصير جداً')
    .max(100),
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('صيغة البريد غير صحيحة').max(255),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل').max(128),
}) as z.ZodType<RegisterInput>;

export const profileSchema: z.ZodType<ProfileInput> = z.object({
  full_name: z.string().min(1, 'الاسم الكامل مطلوب').min(2, 'الاسم قصير جداً').max(100),
  username: z.string().min(1, 'اسم المستخدم مطلوب').min(2, 'اسم المستخدم قصير جداً').max(50).regex(/^[a-zA-Z0-9_]+$/, 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام و _ فقط'),
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('صيغة البريد غير صحيحة').max(255),
  major: z.string().optional(),
}) as z.ZodType<ProfileInput>;

export const securitySchema: z.ZodType<SecurityInput> = z.object({
  current_password: z.string().min(1, 'كلمة المرور الحالية مطلوبة').max(128),
  new_password: z.string().min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل').max(128),
  confirm_password: z.string().min(1, 'تأكيد كلمة المرور مطلوب').max(128),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'كلمة المرور الجديدة وتأكيدها غير متطابقتين',
  path: ['confirm_password'],
}) as z.ZodType<SecurityInput>;

export const deleteAccountSchema: z.ZodType<DeleteAccountInput> = z.object({
  confirmation: z.string().min(1, 'يرجى كتابة اسم المستخدم للتأكيد').max(100),
}) as z.ZodType<DeleteAccountInput>;

export const resetPasswordSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('صيغة البريد غير صحيحة').max(255),
}) satisfies z.ZodType<{ email: string }>;

export type { LoginInput, RegisterInput, ProfileInput, SecurityInput, DeleteAccountInput };
