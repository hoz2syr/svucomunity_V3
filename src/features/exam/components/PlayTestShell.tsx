"use client";

import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Play,
  Settings2,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ErrorState } from '@/src/features/exam/src/components/ErrorState';
import { PlayTestSkeleton } from '@/src/features/exam/src/components/Skeletons';
import { Button } from '@/src/components/ui/Button';
import { RichText } from '../src/components/RichText';
import type { UseCorePlayTestReturn } from '../src/hooks/useCorePlayTest';
import type { ReactNode } from 'react';

interface BackButtonProps {
  label: string;
  icon?: boolean;
  backPath: string;
  showBackIcon?: boolean;
}

const BackButton = ({ label, icon = true, backPath, showBackIcon }: BackButtonProps) => {
  const navigate = useNavigate();
    return (
      <button
        onClick={() => navigate(backPath)}
        className={cn(
          'flex items-center gap-2 px-3 py-2.5 rounded-xl bg-stone-800/50 border border-amber-700/30 text-stone-400 hover:text-stone-100 hover:border-amber-600/50 transition min-h-[44px] shadow-[2px_2px_0px_0px_rgba(180,130,50,0.2)]',
          !showBackIcon && 'gap-0'
        )}
      >
      {showBackIcon && icon && <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
      <span className="text-sm sm:text-base">{label}</span>
    </button>
  );
};

interface PlayTestShellProps {
  state: UseCorePlayTestReturn;
  backPath: string;
  showBackIcon?: boolean;
  showRateUI?: boolean;
  showAnswerReview?: boolean;
  showSettingsInPreStart?: boolean;
  preStartIcon?: ReactNode;
}

export function PlayTestShell({
  state,
  backPath,
  showBackIcon = true,
  showRateUI = true,
  showAnswerReview = true,
  showSettingsInPreStart = true,
  preStartIcon,
}: PlayTestShellProps) {
  const navigate = useNavigate();
  const {
    test,
    isLoading,
    error,
    hasStarted,
    setHasStarted,
    immediateFeedback,
    setImmediateFeedback,
    currentIdx,
    selectedAnswers,
    showResults,
    isAnswerRevealed,
    timeLeft,
    score,
    currentQ,
    isCurrentCorrect,
    handleSelect,
    handleToggleOption,
    handleNext,
    formatTime,
    setCurrentIdx,
    rateTest,
  } = state;

  if (isLoading) return <PlayTestSkeleton />;
  if (error) return <ErrorState title="تعذر تحميل الاختبار" message={error} onRetry={() => navigate(backPath)} />;
  if (!test) return null;

  if (!hasStarted) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 animation-fade-in-up px-3 sm:px-0 pb-24">
        <BackButton label="العودة للاختبارات" backPath={backPath} showBackIcon={showBackIcon} />

        <div className="glass-card border-amber-700/30 shadow-[4px_4px_0px_0px_rgba(180,130,50,0.25)] p-4 sm:p-5 md:p-6 text-center space-y-3 sm:space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto rounded-full bg-cyan-500/10 flex items-center justify-center mb-2 border border-cyan-500/30">
            {preStartIcon || <FileText className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-cyan-400" />}
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-100 mb-1.5 px-2 line-clamp-2">{test.title}</h1>
          {test.description && <div className="text-stone-400 max-w-xl mx-auto px-4 text-xs sm:text-sm"><RichText>{test.description}</RichText></div>}

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 py-4 sm:py-6 border-y border-white/10">
            <div className="text-center px-2 sm:px-3 md:px-4">
              <FileText className="w-4 h-4 sm:w-5 sm:h-6 md:w-6 md:h-6 text-amber-600 mx-auto mb-1 sm:mb-2" />
              <p className="text-stone-400 text-[10px] sm:text-xs md:text-sm mb-0.5 sm:mb-1">الأسئلة</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-stone-100">{test.questions.length}</p>
            </div>
            <div className="text-center px-2 sm:px-3 md:px-4">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-6 md:w-6 md:h-6 text-amber-600 mx-auto mb-1 sm:mb-2" />
              <p className="text-stone-400 text-[10px] sm:text-xs md:text-sm mb-0.5 sm:mb-1">الشروحات المرفقة</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-stone-100">{test.settings.showExplanations ? 'متوفرة' : 'غير متوفرة'}</p>
            </div>
            {test.settings.globalTimeLimitMinutes ? (
              <div className="text-center px-2 sm:px-3 md:px-4">
                <Clock className="w-4 h-4 sm:w-5 sm:h-6 md:w-6 md:h-6 text-amber-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-stone-400 text-[10px] sm:text-xs md:text-sm mb-0.5 sm:mb-1">الوقت المخصص</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-stone-100">{test.settings.globalTimeLimitMinutes} دقيقة</p>
              </div>
            ) : null}
          </div>

          {showSettingsInPreStart && (
             <div className="text-right space-y-2.5 sm:space-y-3 max-w-sm sm:max-w-md mx-auto bg-stone-800/50 p-3.5 sm:p-4 rounded-2xl border border-amber-700/30">
               <div className="flex items-center gap-2 text-stone-100 font-medium mb-2 sm:mb-3">
                 <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                 <h3 className="text-sm sm:text-base">إعدادات بدء الاختبار</h3>
               </div>

              <label className="flex items-start gap-3 cursor-pointer group p-2.5 sm:p-3 rounded-xl hover:bg-white/5 transition">
                <input type="radio" name="feedbackType" checked={!immediateFeedback} onChange={() => setImmediateFeedback(false)} className="mt-0.5 sm:mt-1 w-4 h-4 text-indigo-500 focus:ring-indigo-500 bg-slate-950 border-slate-600" />
                 <div>
                   <p className="text-stone-100 font-medium group-hover:text-amber-300 transition text-sm sm:text-base">تصحيح في النهاية (وضع الاختبار)</p>
                   <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5 sm:mt-1">إظهار الإجابات الصحيحة والشروح والنتيجة بعد الانتهاء من جميع الأسئلة.</p>
                 </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group p-2.5 sm:p-3 rounded-xl hover:bg-white/5 transition">
                <input type="radio" name="feedbackType" checked={immediateFeedback} onChange={() => setImmediateFeedback(true)} className="mt-0.5 sm:mt-1 w-4 h-4 text-indigo-500 focus:ring-indigo-500 bg-slate-950 border-slate-600" />
                 <div>
                   <p className="text-stone-100 font-medium group-hover:text-amber-300 transition text-sm sm:text-base">تصحيح فوري (وضع التعلم)</p>
                   <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5 sm:mt-1">تأكيد كل إجابة وإظهار صحتها مع الشرح التوضيحي فوراً لغرض المراجعة.</p>
                 </div>
              </label>
            </div>
          )}

          <div className="pt-3 sm:pt-4">
            <Button onClick={() => setHasStarted(true)} variant="primary" className="w-full sm:max-w-sm mx-auto flex justify-center items-center gap-2 py-3 text-sm sm:text-base">
              <Play className="w-5 h-5 sm:w-6 sm:h-6" />
               <span>ابدأ الاختبار الآن</span>
             </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-24">
        <BackButton label="العودة للاختبارات" backPath={backPath} showBackIcon={showBackIcon} />
        <div className="glass-card border-amber-700/30 shadow-[4px_4px_0px_0px_rgba(180,130,50,0.25)] text-center p-5 sm:p-6 md:p-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-100 mb-1.5 sm:mb-2">النتيجة النهائية</h2>
          <p className="text-stone-400 mb-2.5 sm:mb-4 text-xs sm:text-sm">لقد أكملت اختبار: {test.title}</p>
          <div className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-600 mb-1.5 sm:mb-2">{score} / {test.questions.length} <span className="text-xl sm:text-2xl md:text-3xl text-stone-400">({Math.round((score / test.questions.length) * 100)}%)</span></div>
          <p className="text-stone-300 font-medium mb-3 sm:mb-5 text-xs sm:text-sm">
            {score === test.questions.length ? 'أداء مثالي! أحسنت صنعاً.' : 'أداء جيد، يمكنك المحاولة مرة أخرى لتحسين النتيجة.'}
          </p>

          {showRateUI && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => rateTest(star)}
                  className="p-1.5 sm:p-2 rounded-lg hover:scale-110 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={`تقييم ${star} من 5`}
                >
                  <Star
                    className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ${star <= (test.rating || 0) ? 'text-amber-600 fill-amber-600' : 'text-stone-500'}`}
                  />
                </button>
              ))}
            </div>
          )}
          {showRateUI && <p className="text-[10px] sm:text-xs text-stone-400">تقييم الاختبار</p>}
        </div>

        {showAnswerReview && (
          <div className="space-y-2.5 sm:space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-stone-100 px-2">مراجعة الإجابات</h3>
            {test.questions.map((q, i) => {
              const userAnswer = selectedAnswers[q.id];
              const isEssay = q.type === 'essay';
              const isCorrect = isEssay ? null : userAnswer === q.correctAnswer;
              const correctAnswers = q.correctAnswers && q.correctAnswers.length > 0 ? q.correctAnswers : (q.correctAnswer ? [q.correctAnswer] : []);
              const borderClass = isEssay ? 'border-s-yellow-500' : (isCorrect ? 'border-s-green-500' : 'border-s-red-500');
              return (
                <div key={q.id} className={cn('glass-card border-s-4 border-amber-700/30', borderClass)}>
                  <div className="flex items-start gap-3 sm:gap-4">
                    {isEssay ? <span className="mt-1 text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30 px-2 py-1 rounded-lg">مقالي</span> : (isCorrect ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 mt-1 flex-shrink-0" /> : <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 mt-1 flex-shrink-0" />)}
                    <div>
                      <h4 className="text-stone-100 font-medium mb-1.5 text-sm sm:text-base">السؤال {i + 1}: <RichText>{q.text}</RichText></h4>
                  <p className="text-sm text-stone-300 mb-1">
                    إجابتك: <span className="text-stone-100 font-bold">{userAnswer || '(تم التخطي)'}</span>
                  </p>
                   {isEssay && correctAnswers.length > 0 && (
                      <div className="mt-2 p-3 rounded-lg border border-slate-700 bg-slate-800/50">
                       <p className="text-xs text-secondary-400 mb-1">الإجابة الصحيحة / الحل</p>
                       <div className="text-sm text-emerald-300"><RichText>{correctAnswers.join(' / ')}</RichText></div>
                     </div>
                   )}
                    {!isEssay && !isCorrect && q.correctAnswer && (
                       <div className="text-sm text-stone-300 text-emerald-400">الإجابة الصحيحة: <RichText>{q.correctAnswer}</RichText></div>
                    )}
                    {q.explanation && test.settings.showExplanations && (
                       <div className="mt-2.5 bg-stone-800/50 p-3 sm:p-3.5 rounded-lg border border-stone-700">
                        <span className="text-amber-600 font-bold text-sm block mb-0.5">الشرح:</span>
                        <div className="text-stone-300 text-sm"><RichText>{q.explanation}</RichText></div>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-24">
      <BackButton label="العودة" backPath={backPath} showBackIcon={showBackIcon} />

      <div className="flex items-center justify-between font-medium text-stone-400 px-2 lg:px-0">
        <span className="text-xs sm:text-sm md:text-base">السؤال {currentIdx + 1} من {test.questions.length}</span>
        {timeLeft !== null && (
                  <span className={cn('font-mono text-base sm:text-lg flex items-center gap-1.5 sm:gap-2', timeLeft <= 60 ? 'text-rose-400 animate-pulse' : 'text-stone-100')}>
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            {formatTime(timeLeft)}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4">
        <button
          onClick={() => { if (currentIdx > 0) setCurrentIdx(currentIdx - 1); }}
          disabled={currentIdx === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-stone-800/50 border border-amber-700/30 text-stone-400 hover:text-stone-100 hover:border-amber-600/50 transition disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(180,130,50,0.2)]"
        >
          {showBackIcon && <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
          <span>السؤال السابق</span>
        </button>
        <button
          onClick={() => { if (currentIdx < test.questions.length - 1) setCurrentIdx(currentIdx + 1); }}
          disabled={currentIdx === test.questions.length - 1}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-stone-800/50 border border-amber-700/30 text-stone-400 hover:text-stone-100 hover:border-amber-600/50 transition disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(180,130,50,0.2)]"
        >
          <span>السؤال التالي</span>
          {showBackIcon && <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
      </div>

      <div className="glass-card border-amber-700/30 shadow-[4px_4px_0px_0px_rgba(180,130,50,0.25)]" tabIndex={showBackIcon ? 0 : undefined}>
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-stone-100 leading-relaxed mb-1 sm:mb-1.5 px-1">
          <RichText>{currentQ.text}</RichText>
        </h2>
        <p className="text-[10px] sm:text-xs text-stone-400 mb-3 sm:mb-4 px-1">الأسهم للتنقل بين الأسئلة · 1-9 للاختيار · t/f لصح/خطأ · Enter للتأكيد</p>

        <div className="space-y-2 sm:space-y-2.5">
          {currentQ.type === 'multiple_choice' && currentQ.options?.map((opt, i) => {
            const isMulti = currentQ.correctAnswers && currentQ.correctAnswers.length > 0;
            const currentSelected = selectedAnswers[currentQ.id];
            const isSelected = isMulti && Array.isArray(currentSelected)
              ? currentSelected.includes(opt)
              : currentSelected === opt;
            const correctList = isMulti ? (currentQ.correctAnswers ?? []) : (currentQ.correctAnswer ? [currentQ.correctAnswer] : []);
             let btnStateClass = 'bg-stone-800 border-stone-700 hover:border-stone-500';

            if (isAnswerRevealed) {
              const isCorrectOption = correctList.includes(opt);
              if (isCorrectOption) {
                 btnStateClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 ring-2 ring-emerald-500/30';
              } else if (isSelected) {
                 btnStateClass = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
              } else {
                 btnStateClass = 'bg-stone-800/50 border-stone-800 opacity-50';
              }
             } else if (isSelected) {
                btnStateClass = 'bg-amber-600/20 border-amber-600 shadow-[4px_4px_0px_0px_rgba(180,130,50,0.25)]';
             }

             return (
               <button key={i} onClick={() => isMulti ? handleToggleOption(opt) : handleSelect(opt)} disabled={isAnswerRevealed} className={cn('w-full text-right p-3 sm:p-4 rounded-xl border transition-all text-stone-100 text-sm sm:text-base', isAnswerRevealed && 'cursor-default', btnStateClass)}>
                 <div className="flex items-center gap-2.5 sm:gap-3">
                   <div className={cn('w-4 h-4 sm:w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition border-2',
                      isSelected ? (!isAnswerRevealed ? 'border-amber-600/30 bg-amber-600' : 'border-emerald-500/30 bg-emerald-500') : 'border-stone-500',
                      isAnswerRevealed && correctList.includes(opt) && 'border-emerald-500/30 bg-emerald-500')}>
                     {(isSelected || (isAnswerRevealed && correctList.includes(opt))) && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-white" />}
                   </div>
                   <span className="text-sm sm:text-base flex-1"><RichText>{opt}</RichText></span>
                 </div>
               </button>
             );
          })}

          {currentQ.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {['true', 'false'].map((val) => {
                const isSelected = selectedAnswers[currentQ.id] === val;
                 let btnStateClass = 'bg-stone-800 border-stone-700 hover:border-stone-500';

                if (isAnswerRevealed) {
                  const isCorrectOption = val === currentQ.correctAnswer?.toLowerCase();
                  if (isCorrectOption) {
                    btnStateClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 ring-2 ring-emerald-500/30';
                  } else if (isSelected) {
                    btnStateClass = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
                  } else {
                    btnStateClass = 'bg-stone-800/50 border-stone-800 opacity-50';
                  }
                 } else if (isSelected) {
                    btnStateClass = 'bg-amber-600/10 border-amber-600/30 shadow-[4px_4px_0px_0px_rgba(180,130,50,0.25)]';
                 }

                return (
                  <button key={val} onClick={() => handleSelect(val)} disabled={isAnswerRevealed} className={cn('w-full text-center p-3 sm:p-4 rounded-xl border transition-all text-stone-100 font-bold text-sm sm:text-base', isAnswerRevealed && 'cursor-default', btnStateClass)}>
                     {val === 'true' ? 'صح' : 'خطأ'}
               </button>
                );
              })}
            </div>
          )}

          {currentQ.type === 'essay' && (
            <textarea className="input-field min-h-[100px] sm:min-h-[120px] text-sm sm:text-base text-stone-100" placeholder="اكتب إجابتك هنا..." value={typeof selectedAnswers[currentQ.id] === 'string' ? (selectedAnswers[currentQ.id] as string) : ''} onChange={(e) => handleSelect(e.target.value)} disabled={isAnswerRevealed} />
          )}
        </div>

        {isAnswerRevealed && (
          <div className={cn('mt-2.5 sm:mt-3 md:mt-4 p-3 sm:p-3.5 rounded-xl border', isCurrentCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30')}>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className={cn('w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0', isCurrentCorrect ? 'text-emerald-400' : 'text-rose-400')}>
                {isCurrentCorrect ? '✓' : '✗'}
              </div>
              <div>
                <h4 className={cn('font-bold mb-0.5 sm:mb-1 text-xs sm:text-sm', isCurrentCorrect ? 'text-emerald-400' : 'text-rose-400')}>
                  {isCurrentCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}
                </h4>
                {!isCurrentCorrect && currentQ.type !== 'essay' && (
                  <p className="text-xs sm:text-sm text-stone-300 mb-1 sm:mb-1.5">الإجابة الصحيحة: <span className="text-stone-100 font-bold">
                    {currentQ.correctAnswers && currentQ.correctAnswers.length > 0 ? currentQ.correctAnswers.join(' / ') : currentQ.correctAnswer}
                  </span></p>
                )}
                {test.settings.showExplanations && currentQ.explanation && (
                  <div className="text-stone-300 text-xs sm:text-sm leading-relaxed mt-1 sm:mt-1.5 p-2 sm:p-2.5 bg-stone-800/50 rounded-lg">
                    <strong className="text-stone-400 ml-1 text-xs sm:text-sm">الشرح:</strong>
                    <RichText>{currentQ.explanation}</RichText>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 sm:mt-5 md:mt-6 pt-3 sm:pt-4 border-t border-white/10 flex justify-end">
            <Button
              onClick={handleNext}
              disabled={(() => { const ans = selectedAnswers[currentQ.id]; if (currentQ.type === 'essay') return false; if (Array.isArray(ans)) return ans.length === 0; return !ans; })()}
              variant="primary"
             className="min-w-[140px] text-sm sm:text-base"
            >
            {immediateFeedback && !isAnswerRevealed && currentQ.type !== 'essay'
              ? 'تأكيد الإجابة'
              : currentIdx === test.questions.length - 1 ? 'إنهاء الاختبار' : 'السؤال التالي'}
          </Button>
        </div>
      </div>
    </div>
  );
}
