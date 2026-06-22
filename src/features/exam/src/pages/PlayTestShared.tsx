"use client";

import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import PlayTest from './PlayTest';
import { useCorePlayTest } from '../hooks';

export default function PlayTestShared() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { test, isLoading, error, hasStarted, setHasStarted, immediateFeedback, setImmediateFeedback, currentIdx, selectedAnswers, showResults, isAnswerRevealed, timeLeft, score, currentQ, isCurrentCorrect, handleSelect, handleNext, formatTime, handleKeyDown, setCurrentIdx, rateTest, canRate } = useCorePlayTest(id, navigate, { publicTestId: id });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060a1f]">
        <div className="text-cyan-400 text-lg">جاري تحميل الاختبار...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#060a1f] gap-4 p-6">
        <div className="text-red-400 text-lg">تعذر تحميل الاختبار</div>
        <p className="text-secondary-400 text-center max-w-md">{error}</p>
        <button onClick={() => navigate('/exam')} className="btn-primary">العودة للاختبارات</button>
      </div>
    );
  }
  if (!test) return null;

  if (!hasStarted) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 animation-fade-in-up px-3 sm:px-0 pb-24">
        <button onClick={() => navigate('/exam')} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition min-h-[44px]">
          <span className="text-sm sm:text-base">العودة للاختبارات</span>
        </button>

        <div className="glass-card p-4 sm:p-6 md:p-8 text-center space-y-4 sm:space-y-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto rounded-full bg-cyan-500/10 flex items-center justify-center mb-2 border border-cyan-500/20">
            <span className="text-2xl">🔗</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 px-2">{test.title}</h1>
          {test.description && <p className="text-secondary-300 max-w-xl mx-auto px-4 text-xs sm:text-sm">{test.description}</p>}

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 py-4 sm:py-6 border-y border-white/10">
            <div className="text-center px-2 sm:px-3 md:px-4">
              <span className="text-secondary-400 text-[10px] sm:text-xs md:text-sm mb-0.5 sm:mb-1 block">الأسئلة</span>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{test.questions.length}</p>
            </div>
            <div className="text-center px-2 sm:px-3 md:px-4">
              <span className="text-secondary-400 text-[10px] sm:text-xs md:text-sm mb-0.5 sm:mb-1 block">الشروحات المرفقة</span>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{test.settings.showExplanations ? 'متوفرة' : 'غير متوفرة'}</p>
            </div>
            {test.settings.globalTimeLimitMinutes ? (
              <div className="text-center px-2 sm:px-3 md:px-4">
                <span className="text-secondary-400 text-[10px] sm:text-xs md:text-sm mb-0.5 sm:mb-1 block">الوقت المخصص</span>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{test.settings.globalTimeLimitMinutes} دقيقة</p>
              </div>
            ) : null}
          </div>

          <div className="text-right space-y-3 sm:space-y-4 max-w-sm sm:max-w-md mx-auto bg-secondary-800/50 p-4 sm:p-5 rounded-2xl border border-secondary-700/50">
            <div className="flex items-center gap-2 text-white font-medium mb-3 sm:mb-4">
              <span className="text-sm sm:text-base">إعدادات بدء الاختبار</span>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group p-2.5 sm:p-3 rounded-xl hover:bg-white/5 transition">
              <input type="radio" name="feedbackType" checked={!immediateFeedback} onChange={() => setImmediateFeedback(false)} className="mt-0.5 sm:mt-1 w-4 h-4 text-cyan-500 focus:ring-cyan-500 bg-secondary-900 border-secondary-600" />
              <div>
                <p className="text-white font-medium group-hover:text-cyan-300 transition text-sm sm:text-base">تصحيح في النهاية (وضع الاختبار)</p>
                <p className="text-[10px] sm:text-xs text-secondary-400 mt-0.5 sm:mt-1">إظهار الإجابات الصحيحة والشروح والنتيجة بعد الانتهاء من جميع الأسئلة.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group p-2.5 sm:p-3 rounded-xl hover:bg-white/5 transition">
              <input type="radio" name="feedbackType" checked={immediateFeedback} onChange={() => setImmediateFeedback(true)} className="mt-0.5 sm:mt-1 w-4 h-4 text-cyan-500 focus:ring-cyan-500 bg-secondary-900 border-secondary-600" />
              <div>
                <p className="text-white font-medium group-hover:text-cyan-300 transition text-sm sm:text-base">تصحيح فوري (وضع التعلم)</p>
                <p className="text-[10px] sm:text-xs text-secondary-400 mt-0.5 sm:mt-1">تأكيد كل إجابة وإظهار صحتها مع الشرح التوضيحي فوراً لغرض المراجعة.</p>
              </div>
            </label>
          </div>

          <div className="pt-3 sm:pt-4">
            <button onClick={() => setHasStarted(true)} className="btn-primary w-full sm:max-w-sm mx-auto flex justify-center items-center gap-2 py-3 sm:py-3.5 text-sm sm:text-base sm:text-lg">
              <span>ابدأ الاختبار الآن</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-24">
        <button onClick={() => navigate('/exam')} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition min-h-[44px]">
          <span className="text-sm sm:text-base">العودة للاختبارات</span>
        </button>

        <div className="glass-card text-center p-5 sm:p-8 md:p-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">النتيجة النهائية</h2>
          <p className="text-secondary-400 mb-3 sm:mb-5 text-xs sm:text-sm">لقد أكملت اختبار: {test.title}</p>
          <div className="text-4xl sm:text-5xl md:text-6xl font-black gradient-text mb-2 sm:mb-3">{score} / {test.questions.length}</div>
          <p className="text-secondary-300 font-medium mb-4 sm:mb-6 text-xs sm:text-sm">
            {score === test.questions.length ? 'أداء مثالي! أحسنت صنعاً.' : 'أداء جيد، يمكنك المحاولة مرة أخرى لتحسين النتيجة.'}
          </p>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-24">
      <button onClick={() => navigate('/exam')} className="text-secondary-400 hover:text-white flex items-center gap-2 mb-4 sm:mb-6 transition min-h-[44px]">
        <span className="text-sm sm:text-base">العودة</span>
      </button>

      <div className="flex items-center justify-between font-medium text-secondary-300 px-2 lg:px-0">
        <span className="text-xs sm:text-sm md:text-base">السؤال {currentIdx + 1} من {test.questions.length}</span>
        {timeLeft !== null && (
          <span className="font-mono text-base sm:text-lg flex items-center gap-1.5 sm:gap-2">
            {formatTime(timeLeft)}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4">
        <button
          onClick={() => { if (currentIdx > 0) setCurrentIdx(currentIdx - 1); }}
          disabled={currentIdx === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base"
        >
          <span>السؤال السابق</span>
        </button>
        <button
          onClick={() => { if (currentIdx < test.questions.length - 1) setCurrentIdx(currentIdx + 1); }}
          disabled={currentIdx === test.questions.length - 1}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base"
        >
          <span>السؤال التالي</span>
        </button>
      </div>

      <div className="glass-card" tabIndex={0}>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-relaxed mb-1.5 sm:mb-2 px-1">{currentQ.text}</h2>

        <div className="space-y-2.5 sm:space-y-3">
          {currentQ.type === 'multiple_choice' && currentQ.options?.map((opt, i) => {
            const isSelected = selectedAnswers[currentQ.id] === opt;
            let btnStateClass = 'bg-secondary-800 border-secondary-700 hover:border-secondary-500';

            if (isAnswerRevealed) {
              const isCorrectOption = opt === currentQ.correctAnswer;
              if (isCorrectOption) {
                btnStateClass = 'bg-green-500/20 border-green-500 text-green-400 ring-2 ring-green-500';
              } else if (isSelected) {
                btnStateClass = 'bg-red-500/20 border-red-500 text-red-400';
              } else {
                btnStateClass = 'bg-secondary-800/50 border-secondary-800 opacity-50';
              }
            } else if (isSelected) {
              btnStateClass = 'bg-primary-500/20 border-primary-500 shadow-[0_0_0_2px_rgba(14,165,233,0.2)]';
            }

            return (
              <button key={i} onClick={() => handleSelect(opt)} disabled={isAnswerRevealed} className={cn('w-full text-right p-3 sm:p-4 rounded-xl border transition-all text-white text-sm sm:text-base', isAnswerRevealed && 'cursor-default', btnStateClass)}>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className={cn('w-4 h-4 sm:w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition',
                    isSelected ? (!isAnswerRevealed ? 'border-primary-500' : (opt === currentQ.correctAnswer ? 'border-green-500' : 'border-red-500')) : 'border-secondary-500',
                    isAnswerRevealed && opt === currentQ.correctAnswer && 'border-green-500')}>
                    {isSelected && <div className={cn('w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full', !isAnswerRevealed ? 'bg-primary-500' : (opt === currentQ.correctAnswer ? 'bg-green-500' : 'bg-red-500'))} />}
                    {!isSelected && isAnswerRevealed && opt === currentQ.correctAnswer && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500" />}
                  </div>
                  <span className="text-sm sm:text-base">{opt}</span>
                </div>
              </button>
            );
          })}

          {currentQ.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {['true', 'false'].map((val) => {
                const isSelected = selectedAnswers[currentQ.id] === val;
                let btnStateClass = 'bg-secondary-800 border-secondary-700 hover:border-secondary-500';

                if (isAnswerRevealed) {
                  const isCorrectOption = val === currentQ.correctAnswer?.toLowerCase();
                  if (isCorrectOption) {
                    btnStateClass = 'bg-green-500/20 border-green-500 text-green-400 ring-2 ring-green-500';
                  } else if (isSelected) {
                    btnStateClass = 'bg-red-500/20 border-red-500 text-red-400';
                  } else {
                    btnStateClass = 'bg-secondary-800/50 border-secondary-800 opacity-50';
                  }
                } else if (isSelected) {
                  btnStateClass = 'bg-primary-500/20 border-primary-500 shadow-[0_0_0_2px_rgba(14,165,233,0.2)]';
                }

                return (
                  <button key={val} onClick={() => handleSelect(val)} disabled={isAnswerRevealed} className={cn('w-full text-center p-3 sm:p-4 rounded-xl border transition-all text-white font-bold text-sm sm:text-lg', isAnswerRevealed && 'cursor-default', btnStateClass)}>
                    {val === 'true' ? 'صح' : 'خطأ'}
                  </button>
                );
              })}
            </div>
          )}

          {currentQ.type === 'essay' && (
            <textarea className="input-field min-h-[100px] sm:min-h-[120px] text-sm sm:text-base" placeholder="اكتب إجابتك هنا..." value={selectedAnswers[currentQ.id] || ''} onChange={(e) => handleSelect(e.target.value)} disabled={isAnswerRevealed} />
          )}
        </div>

        {isAnswerRevealed && (
          <div className={cn('mt-3 sm:mt-4 md:mt-6 p-3 sm:p-4 rounded-xl border', isCurrentCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30')}>
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className={cn('w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0', isCurrentCorrect ? 'text-green-400' : 'text-red-400')}>
                {isCurrentCorrect ? '✓' : '✗'}
              </div>
              <div>
                <h4 className={cn('font-bold mb-0.5 sm:mb-1 text-sm sm:text-base', isCurrentCorrect ? 'text-green-400' : 'text-red-400')}>
                  {isCurrentCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}
                </h4>
                {!isCurrentCorrect && currentQ.correctAnswer && currentQ.type !== 'essay' && (
                  <p className="text-xs sm:text-sm text-secondary-300 mb-1.5 sm:mb-2">الإجابة الصحيحة هي: <span className="font-bold text-white">{currentQ.correctAnswer}</span></p>
                )}
                {test.settings.showExplanations && currentQ.explanation && (
                  <p className="text-secondary-300 text-xs sm:text-sm leading-relaxed mt-1.5 sm:mt-2 p-2.5 sm:p-3 bg-secondary-900/50 rounded-lg">
                    <strong className="text-secondary-400 ml-1 text-xs sm:text-sm">الشرح:</strong>
                    {currentQ.explanation}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 sm:mt-6 md:mt-8 pt-4 sm:pt-6 border-t border-white/10 flex justify-end">
          <button onClick={handleNext} disabled={!selectedAnswers[currentQ.id] && currentQ.type !== 'essay'} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] text-sm sm:text-base">
            {immediateFeedback && !isAnswerRevealed && currentQ.type !== 'essay'
              ? 'تأكيد الإجابة'
              : currentIdx === test.questions.length - 1 ? 'إنهاء الاختبار' : 'السؤال التالي'}
          </button>
        </div>
      </div>
    </div>
  );
}
