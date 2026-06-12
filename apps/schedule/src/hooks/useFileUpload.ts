import { useState, useCallback } from 'react';
import type { ExtractionResult } from '../services/types';
import { extractScheduleFromImage } from '../services/gemini';
import { supabase } from '../services/supabase';

interface UseFileUploadReturn {
  isUploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOAD_TIMEOUT = 30000; // 30 seconds

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

// ─── Magic Number Verification ────────────────────────────────
// يتحقق من بايتات الملف الأولية لمنع تزوير MIME type

const FILE_SIGNATURES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // "RIFF" header
};

async function validateImageFile(file: File): Promise<string | null> {
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return 'Invalid file type. Only JPG, PNG and WebP are allowed.';
  }

  const header = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(header);

  const signature = FILE_SIGNATURES[file.type];
  const isValid = signature ? signature.every((byte, index) => bytes[index] === byte) : false;

  if (!isValid) {
    return 'File is not a valid image. Please upload a real image file.';
  }

  return null;
}

// ─── Base64 Conversion (بعد التحقق) ───────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

// ─── Hook ─────────────────────────────────────────────────────

export function useFileUpload(
  onSuccess: (result: ExtractionResult) => void,
  onError: (message: string | null) => void
): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. تحقق من الحجم
    if (file.size > MAX_FILE_SIZE) {
      onError(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      return;
    }

    // 2. تحقق من Magic Numbers (أمن)
    const validationError = await validateImageFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }

    // 3. AbortController لمنع الهجمات الطويلة
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

    setIsUploading(true);
    onError(null);

    try {
      const base64 = await fileToBase64(file);

      const result = await extractScheduleFromImage(base64, file.type, supabase, controller.signal);
      clearTimeout(timeoutId);
      onSuccess(result);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        onError('GEMINI_TIMEOUT: تجاوز الوقت المسموح لمعالجة الصورة.');
      } else {
        const message = err instanceof Error ? err.message : 'Failed to process image.';
        onError(message);
      }
    } finally {
      clearTimeout(timeoutId);
      setIsUploading(false);
    }
  }, [onSuccess, onError]);

  return { isUploading, handleFileUpload };
}
