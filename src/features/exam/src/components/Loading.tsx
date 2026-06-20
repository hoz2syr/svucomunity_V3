"use client";

import { Loader2 } from 'lucide-react';

export function LoadingScreen({ message = 'جاري التحميل...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full animation-fade-in">
      <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
      <p className="text-secondary-400 font-medium text-lg tracking-wide">{message}</p>
    </div>
  );
}
