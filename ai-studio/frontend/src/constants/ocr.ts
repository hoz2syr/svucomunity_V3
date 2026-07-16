import type { ProcessingStep } from '../types'

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.pdf'] as const
export const MAX_FILE_SIZE = 50 * 1024 * 1024

export const PROCESSING_STEPS: Omit<ProcessingStep, 'status'>[] = [
  { key: 'upload', label: 'رفع الملف', description: 'جاري رفع الملف...' },
  { key: 'ocr', label: 'استخراج النص', description: 'تحليل الملف بالذكاء الاصطناعي...' },
  { key: 'format', label: 'تنسيق النتائج', description: 'تنظيم النص والجداول...' },
  { key: 'done', label: 'اكتمل', description: 'تم الاستخراج بنجاح' },
]
