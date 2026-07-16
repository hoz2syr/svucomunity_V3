"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";

interface DropZoneProps {
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  isExtracting: boolean;
  onExtract: () => void;
  disabled?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}

export function DropZone({
  previewUrl,
  onFileSelect,
  onClear,
  isExtracting,
  onExtract,
  disabled = false,
  inputRef,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const internalInputRef = useRef<HTMLInputElement>(null);

  const resolvedInputRef = inputRef || internalInputRef;
  const inputElement = (resolvedInputRef as React.RefObject<HTMLInputElement | null>).current;

  const openFilePicker = () => {
    inputElement?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200 outline-none
          ${
            isDragOver
              ? "border-[var(--color-primary-500)] bg-white/5"
              : "border-white/15 hover:border-[var(--color-primary-500)]/50 hover:bg-white/5"
          }
          focus-visible:border-[var(--color-primary-500)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]/50
        `}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFilePicker();
          }
        }}
        aria-label="رفع صورة الجدول"
      >
        <input
          ref={resolvedInputRef as React.Ref<HTMLInputElement>}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />

        {previewUrl ? (
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="معاينة الجدول"
              loading="lazy"
              width="256"
              height="256"
              className="max-h-64 mx-auto rounded-xl shadow-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute top-2 left-2 bg-rose-500/90 hover:bg-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-lg"
              aria-label="إزالة الصورة"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="py-6">
            <UploadCloud className="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <p className="text-white font-medium mb-1">
              اسحب صورة جدولك الدراسي هنا
            </p>
            <p className="text-slate-500 text-sm">
              أو انقر لاختيار ملف (PNG, JPG - حتى 10MB)
            </p>
          </div>
        )}
      </div>

      {previewUrl && (
        <button
          onClick={onExtract}
          disabled={isExtracting || disabled}
          className="w-full py-3 px-6 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] disabled:bg-[var(--color-primary-600)]/50 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {isExtracting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري الاستخراج...</span>
            </>
          ) : (
            "🔍 استخراج الجدول"
          )}
        </button>
      )}
    </div>
  );
}
