import { z } from 'zod';
import type { BulkImportItem } from '../types';

export const referenceTypeSchema = z.enum(['video', 'reference', 'link']);

export const bulkImportItemSchema: z.ZodType<BulkImportItem> = z.object({
  course_code: z
    .string()
    .min(1, 'رمز المادة مطلوب')
    .max(20, 'رمز المادة طويل جداً')
    .regex(/^[A-Za-z0-9]+$/, 'رمز المادة يجب أن يحتوي على أحرف إنجليزية وأرقام فقط'),
  type: referenceTypeSchema,
  title: z
    .string()
    .min(1, 'عنوان المصدر مطلوب')
    .max(500, 'العنوان طويل جداً'),
  url: z
    .string()
    .min(1, 'رابط المصدر مطلوب')
    .url('صيغة الرابط غير صحيحة')
    .max(2000, 'الرابط طويل جداً'),
  description: z
    .string()
    .max(2000, 'الوصف طويل جداً')
    .optional(),
  is_approved: z
    .boolean()
    .optional(),
});

export const bulkImportSchema = z.object({
  items: z
    .array(bulkImportItemSchema)
    .min(1, 'يرجى إدخال مصدر واحد على الأقل')
    .max(200, 'الحد الأقصى هو 200 مصدر في المرة الواحدة'),
});

export function validateBulkImportItems(raw: unknown): { data: BulkImportItem[] | null; errors: { index: number; message: string }[] } {
  const parseResult = bulkImportSchema.safeParse(raw);
  if (parseResult.success) {
    return { data: parseResult.data.items, errors: [] };
  }
  const errors: { index: number; message: string }[] = [];
  for (const issue of parseResult.error.issues) {
    const path = issue.path;
    const index = path[0] !== undefined && typeof path[0] === 'number' ? path[0] : -1;
    errors.push({ index, message: issue.message });
  }
  return { data: null, errors };
}
