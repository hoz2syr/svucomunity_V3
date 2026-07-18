"use client";

import { useState, useRef, useCallback } from 'react';
import { UploadCloud, X, CheckCircle2, AlertTriangle, Loader2, FileJson } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { Icon } from '@/src/components/ui/Icon';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { ModalShell } from '@/src/features/study-groups/components/ModalShell';
import type { BulkImportItem, BulkImportResult } from '../src/types';
import { validateBulkImportItems } from '../src/schemas/bulk-import.schema';
import { bulkInsertReferences } from '../src/services/subjects.service';
import { useToast } from '@/src/components/ui/Toast';

type Step = 'upload' | 'preview' | 'importing' | 'result';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminId: string;
  onImported: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function BulkImportModal({ isOpen, onClose, adminId, onImported }: BulkImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [rawItems, setRawItems] = useState<BulkImportItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ index: number; message: string }[]>([]);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetState = useCallback(() => {
    setStep('upload');
    setRawItems([]);
    setValidationErrors([]);
    setImportResult(null);
    setFileName(null);
    setIsDragOver(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const parseAndValidate = useCallback((content: string) => {
    try {
      const parsed = JSON.parse(content);
      const { data, errors } = validateBulkImportItems(parsed);
      if (!data) {
        setValidationErrors(errors);
        setRawItems([]);
        setStep('preview');
      } else {
        setRawItems(data);
        setValidationErrors([]);
        setStep('preview');
      }
    } catch {
      setValidationErrors([{ index: -1, message: 'صيغة JSON غير صحيحة. يرجى التحقق من الملف.' }]);
      setRawItems([]);
      setStep('preview');
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast('حجم الملف يتجاوز 5MB', 'error');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseAndValidate(content);
    };
    reader.readAsText(file);
  }, [parseAndValidate, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      handleFileSelect(file);
    } else {
      toast('يرجى رفع ملف JSON فقط', 'error');
    }
  }, [handleFileSelect, toast]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleConfirmImport = async () => {
    setStep('importing');
    const result = await bulkInsertReferences(adminId, rawItems);
    if (result.error) {
      toast(result.error.message, 'error');
      setStep('preview');
    } else if (result.data) {
      setImportResult(result.data);
      setStep('result');
      if (result.data.failed > 0) {
        toast(`تم استيراد ${result.data.succeeded} من ${result.data.total} مصدر`, 'info');
      } else {
        toast(`تم استيراد ${result.data.succeeded} مصدر بنجاح`, 'success');
      }
    }
  };

  const handleFinish = () => {
    resetState();
    onImported();
    onClose();
  };

  const validItems = rawItems.filter((_, i) => !validationErrors.some((e) => e.index === i));

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} maxWidth="max-w-3xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">استيراد مصادر جماعي</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
            <Icon icon={X} size="sm" />
          </button>
        </div>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="text-sm text-slate-400">
              ارفع ملف JSON يحتوي على مصفوفة من المصادر. الحد الأقصى 200 مصدر وحجم الملف 5MB.
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
                isDragOver ? 'border-cyan-500 bg-white/5' : 'border-white/15 hover:border-white/30 hover:bg-white/5'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleInputChange}
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <p className="text-white font-medium mb-1">اسحب ملف JSON هنا</p>
              <p className="text-slate-500 text-sm">أو انقر لاختيار ملف (.json)</p>
              {fileName && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
                  <Icon icon={FileJson} size="xs" />
                  {fileName}
                </div>
              )}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-slate-400">
              <div className="font-medium text-slate-300 mb-2">صيغة الملف المتوقعة:</div>
              <pre className="overflow-x-auto text-[11px] leading-relaxed">
{`[
  {
    "course_code": "CS101",
    "type": "video",
    "title": "محاضرة 1 - مقدمة",
    "url": "https://youtube.com/watch?v=...",
    "description": "شرح المفاهيم الأساسية",
    "is_approved": true
  }
]`}
              </pre>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                تم العثور على <span className="text-white font-medium">{validItems.length}</span> مصدر صالح
                {validationErrors.length > 0 && (
                  <span className="text-rose-400 mr-2">و {validationErrors.length} خطأ</span>
                )}
              </div>
              <Button variant="secondary" onClick={() => setStep('upload')}>تعديل الملف</Button>
            </div>

            {validationErrors.length > 0 && (
              <GlassCard className="p-4 border-rose-500/30">
                <div className="flex items-center gap-2 text-rose-400 mb-2">
                  <Icon icon={AlertTriangle} size="sm" />
                  <span className="text-sm font-medium">أخطاء التحقق</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {validationErrors.map((err, i) => (
                    <div key={i} className="text-xs text-slate-400">
                      السجل {err.index >= 0 ? `#${err.index + 1}` : 'غير معروف'}: {err.message}
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            <div className="border border-white/10 rounded-xl overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-white/5 text-slate-400 sticky top-0">
                    <tr>
                      <th className="text-right px-3 py-2 font-medium">#</th>
                      <th className="text-right px-3 py-2 font-medium">رمز المادة</th>
                      <th className="text-right px-3 py-2 font-medium">النوع</th>
                      <th className="text-right px-3 py-2 font-medium">العنوان</th>
                      <th className="text-right px-3 py-2 font-medium">الرابط</th>
                      <th className="text-right px-3 py-2 font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rawItems.map((item, i) => {
                      const hasError = validationErrors.some((e) => e.index === i);
                      return (
                        <tr key={i} className={cn(hasError ? 'bg-rose-500/5' : 'hover:bg-white/5')}>
                          <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                          <td className="px-3 py-2 text-white font-mono">{item.course_code}</td>
                          <td className="px-3 py-2">
                            <span className={cn(
                              'px-2 py-0.5 rounded-md text-[10px]',
                              item.type === 'video' && 'bg-red-500/10 text-red-400',
                              item.type === 'reference' && 'bg-cyan-500/10 text-cyan-400',
                              item.type === 'link' && 'bg-green-500/10 text-green-400',
                            )}>
                              {item.type === 'video' ? 'فيديو' : item.type === 'reference' ? 'مرجع' : 'رابط'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-white max-w-[200px] truncate">{item.title}</td>
                          <td className="px-3 py-2 text-slate-400 max-w-[180px] truncate font-mono text-[10px]">{item.url}</td>
                          <td className="px-3 py-2">
                            {hasError ? (
                              <span className="text-rose-400 flex items-center gap-1">
                                <Icon icon={AlertTriangle} size="xs" />
                                خطأ
                              </span>
                            ) : (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <Icon icon={CheckCircle2} size="xs" />
                                صالح
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="primary" onClick={handleConfirmImport} disabled={validItems.length === 0}>
                استيراد {validItems.length} مصدر
              </Button>
              <Button variant="secondary" onClick={handleClose}>إلغاء</Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <p className="text-white font-medium">جاري استيراد المصادر...</p>
            <p className="text-slate-400 text-sm">يرجى الانتظار، لا تغلق النافذة</p>
          </div>
        )}

        {step === 'result' && importResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <GlassCard className="p-4 text-center">
                <div className="text-2xl font-bold text-white">{importResult.total}</div>
                <div className="text-xs text-slate-400 mt-1">الإجمالي</div>
              </GlassCard>
              <GlassCard className="p-4 text-center border-emerald-500/30">
                <div className="text-2xl font-bold text-emerald-400">{importResult.succeeded}</div>
                <div className="text-xs text-slate-400 mt-1">نجح</div>
              </GlassCard>
              <GlassCard className="p-4 text-center border-rose-500/30">
                <div className="text-2xl font-bold text-rose-400">{importResult.failed}</div>
                <div className="text-xs text-slate-400 mt-1">فشل</div>
              </GlassCard>
            </div>

            {importResult.errors.length > 0 && (
              <GlassCard className="p-4 border-rose-500/30">
                <div className="flex items-center gap-2 text-rose-400 mb-2">
                  <Icon icon={AlertTriangle} size="sm" />
                  <span className="text-sm font-medium">تفاصيل الأخطاء</span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="text-xs text-slate-400">
                      الدفعة {err.index >= 0 ? `بداية من السجل ${err.index + 1}` : ''}: {err.message}
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="primary" onClick={handleFinish}>تم</Button>
              <Button variant="secondary" onClick={() => { resetState(); setStep('upload'); }}>
                استيراد ملف آخر
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}
