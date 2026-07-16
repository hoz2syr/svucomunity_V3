import { z } from 'zod';
import type { DeleteAccountInput, LoginInput, ProfileInput, RegisterInput, SecurityInput } from '../types/auth';

export const loginSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('صيغة البريد غير صحيحة').max(255),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل').max(128),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'الاسم مطلوب')
    .min(2, 'الاسم قصير جداً')
    .max(100),
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('صيغة البريد غير صحيحة').max(255),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل').max(128),
});

export const profileSchema = z.object({
  full_name: z.string().min(1, 'الاسم الكامل مطلوب').min(2, 'الاسم قصير جداً').max(100),
  username: z.string().min(1, 'اسم المستخدم مطلوب').min(2, 'اسم المستخدم قصير جداً').max(50).regex(/^[a-zA-Z0-9_]+$/, 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام و _ فقط'),
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('صيغة البريد غير صحيحة').max(255),
  major: z.string().optional(),
  current_semester: z.string().optional(),
});

export const securitySchema = z.object({
  current_password: z.string().min(1, 'كلمة المرور الحالية مطلوبة').max(128),
  new_password: z.string().min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل').max(128),
  confirm_password: z.string().min(1, 'تأكيد كلمة المرور مطلوب').max(128),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'كلمة المرور الجديدة وتأكيدها غير متطابقتين',
  path: ['confirm_password'],
});

export const deleteAccountSchema = z.object({
  confirmation: z.string().min(1, 'يرجى كتابة اسم المستخدم للتأكيد').max(100),
});

export const resetPasswordSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('صيغة البريد غير صحيحة').max(255),
}) satisfies z.ZodType<{ email: string }>;

export type { LoginInput, RegisterInput, ProfileInput, SecurityInput, DeleteAccountInput };
