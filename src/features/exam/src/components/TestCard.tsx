"use client";

import { Link } from 'react-router-dom';
import { FileText, Clock, Play, Printer, Download, Trash2 } from 'lucide-react';
import { TestModel } from '../types';
import { cn } from '../lib/utils';
import { StarRating } from './StarRating';

interface TestCardProps {
  test: TestModel;
  loadingPdf: string | null;
  onPrintPdf: (test: TestModel) => void;
  onExportWord: (test: TestModel) => void;
  onDelete: (id: string) => void;
}

export function TestCard({ test, loadingPdf, onPrintPdf, onExportWord, onDelete }: TestCardProps) {
  return (
    <div className="glass-card flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] hover:border-white/15 bg-secondary-900/50 border border-white/[0.06]">
      <div className="flex-1 p-5 pb-4">
        <h3 className="text-lg font-bold text-white mb-2 leading-snug line-clamp-2">{test.title}</h3>

        {test.description && (
          <p className="text-secondary-400 text-sm mb-4 leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {test.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 bg-secondary-800/70 text-secondary-300 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-white/5">
            <FileText className="w-3.5 h-3.5 text-primary-400" />
            <span>{test.questions.length} سؤال</span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-secondary-800/70 text-secondary-300 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-white/5">
            <Clock className="w-3.5 h-3.5 text-primary-400" />
            <span>{new Date(test.createdAt).toLocaleDateString('ar-SA')}</span>
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <StarRating rating={test.rating ?? 0} readonly size={16} />
          {test.rating ? (
            <span className="text-xs text-secondary-400">{test.rating}/5</span>
          ) : (
            <span className="text-xs text-secondary-500">غير مقيم</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 p-5 pt-2 border-t border-white/[0.06] bg-secondary-900/30">
        <Link
          to={`/exam/play/${test.id}`}
          className="btn-accent w-full py-2.5 text-sm flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-primary-900/20 hover:shadow-primary-800/30 transition-all"
        >
          <Play className="w-4 h-4 fill-white" />
          <span className="font-medium">خوض الاختبار</span>
        </Link>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onPrintPdf(test)}
            disabled={loadingPdf === test.id}
            className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{loadingPdf === test.id ? '...' : 'PDF'}</span>
          </button>
          <button
            onClick={() => onExportWord(test)}
            className="btn-glass flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5 rounded-xl"
            title="تصدير Word"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Word</span>
          </button>
          <button
            onClick={() => onDelete(test.id)}
            className="btn-danger flex-1 py-2.5 text-sm flex items-center justify-center rounded-xl"
            title="حذف الاختبار"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
