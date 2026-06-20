"use client";

import { useState, useCallback } from 'react';

export function useCopyToClipboard(text: string) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [text]);

  return { isCopied, copy };
}

function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try { document.execCommand('copy'); } catch { /* ignore */ }
  document.body.removeChild(textarea);
}
