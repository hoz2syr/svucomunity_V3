"use client";

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Clock, Target, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { useTestAttempts } from '../hooks';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function AttemptHistory() {
  const navigate = useNavigate();
  const { attempts, isLoading, error, refetch } = useTestAttempts();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animation-fade-in-up mt-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/exam/saved')}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">العودة للاختبارات</span>
        </button>

        <PrimaryButton onClick={refetch} className="px-4 py-2.5 text-sm">
          تحديث
        </PrimaryButton>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">سجل المحاولات</h1>
        <p className="text-secondary-400 text-sm sm:text-base">جميع نتائجك السابقة في الاختبارات</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="glass-card p-6 text-center space-y-4">
          <p className="text-[var(--color-danger-400)]">{error}</p>
          <PrimaryButton onClick={refetch} className="mx-auto">إعادة المحاولة</PrimaryButton>
        </div>
      )}

      {!isLoading && !error && attempts.length === 0 && (
        <div className="glass-card p-8 text-center space-y-4">
          <FileText className="w-12 h-12 text-secondary-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">لا توجد محاولات بعد</h2>
          <p className="text-secondary-400 text-sm">قم بإجراء اختبار لرؤية نتائجك هنا</p>
          <PrimaryButton onClick={() => navigate('/exam/browse')} className="mx-auto">تصفح الاختبارات</PrimaryButton>
        </div>
      )}

      {!isLoading && !error && attempts.length > 0 && (
        <div className="space-y-3">
          {attempts.map((attempt) => {
            const percentage = Math.round((attempt.score / attempt.total) * 100);
            const isPerfect = percentage === 100;
            const isPass = percentage >= 50;

            return (
              <div key={attempt.id} className="glass-card p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isPerfect ? 'bg-[var(--color-success-light)] border-2 border-[var(--color-success-border)]' :
                      isPass ? 'bg-[var(--color-info-light)] border-2 border-[var(--color-info-border)]' :
                      'bg-[var(--color-danger-light)] border-2 border-[var(--color-danger-border)]'
                    }`}>
                      {isPerfect ? <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-success-400)]" /> :
                       isPass ? <Target className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-info-400)]" /> :
                       <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-danger-400)]" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base">اختبار #{attempt.testId.slice(0, 8)}</h3>
                      <div className="flex items-center gap-2 text-secondary-400 text-xs sm:text-sm">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {formatDate(attempt.completedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-left">
                      <p className={`text-xl sm:text-2xl font-black ${isPerfect ? 'text-[var(--color-success-400)]' : isPass ? 'text-[var(--color-info-400)]' : 'text-[var(--color-danger-400)]'}`}>
                        {attempt.score} / {attempt.total}
                      </p>
                      <p className="text-secondary-400 text-[10px] sm:text-xs">{percentage}%</p>
                    </div>
                    <div className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold ${
                      isPerfect ? 'bg-[var(--color-success-light)] text-[var(--color-success-300)]' :
                      isPass ? 'bg-[var(--color-info-light)] text-[var(--color-info-400)]' :
                      'bg-[var(--color-danger-light)] text-[var(--color-danger-400)]'
                    }`}>
                      {isPerfect ? 'ممتاز' : isPass ? 'ناجح' : 'راسب'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs text-secondary-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {Object.values(attempt.answers).filter(a => a.trim() !== '').length} من {attempt.total}answered
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
