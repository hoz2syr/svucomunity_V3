"use client";

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Play, Settings2, Clock, FileText, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { ErrorState } from '../components/ErrorState';
import { PlayTestSkeleton } from '../components/Skeletons';
import { useCorePlayTest } from '../hooks';

export default function PlayTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { test, isLoading, error, hasStarted, setHasStarted, immediateFeedback, setImmediateFeedback, currentIdx, selectedAnswers, showResults, isAnswerRevealed, timeLeft, score, currentQ, isCurrentCorrect, handleSelect, handleNext, formatTime, handleKeyDown, setCurrentIdx, rateTest } = useCorePlayTest(id, navigate);

  if (isLoading) return <PlayTestSkeleton />;
  if (error) return <ErrorState title="تعذر تحميل الاختبار" message={error} onRetry={() => navigate('/exam/saved')} />;
  if (!test) return null;

  if (!hasStarted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animation-fade-in-up px-3 sm:px-0 pb-24">
        <button onClick={() => navigate('/exam/saved')} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>العودة للاختبارات</span>
        </button>

        <div className="glass-card p-6 sm:p-8 md:p-12 text-center space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-cyan-500/10 flex items-center justify-center mb-2 border border-cyan-500/20">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 px-2">{test.title}</h1>
          {test.description && <p className="text-secondary-300 max-w-xl mx-auto px-4 text-sm sm:text-base">{test.description}</p>}

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 py-6 border-y border-white/10">
            <div className="text-center px-3 sm:px-4">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-secondary-400 text-xs sm:text-sm mb-1">الأسئلة</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{test.questions.length}</p>
            </div>
            <div className="text-center px-3 sm:px-4">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-secondary-400 text-xs sm:text-sm mb-1">الشروحات المرفقة</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{test.settings.showExplanations ? 'متوفرة' : 'غير متوفرة'}</p>
            </div>
            {test.settings.globalTimeLimitMinutes ? (
              <div className="text-center px-3 sm:px-4">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-secondary-400 text-xs sm:text-sm mb-1">الوقت المخصص</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{test.settings.globalTimeLimitMinutes} دقيقة</p>
              </div>
            ) : null}
          </div>

          <div className="text-right space-y-4 max-w-sm sm:max-w-md mx-auto bg-secondary-800/50 p-5 sm:p-6 rounded-2xl border border-secondary-700/50">
            <div className="flex items-center gap-2 text-white font-medium mb-4">
              <Settings2 className="w-5 h-5 text-cyan-400" />
              <h3>إعدادات بدء الاختبار</h3>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition">
              <input type="radio" name="feedbackType" checked={!immediateFeedback} onChange={() => setImmediateFeedback(false)} className="mt-1 w-4 h-4 text-cyan-500 focus:ring-cyan-500 bg-secondary-900 border-secondary-600" />
              <div>
                <p className="text-white font-medium group-hover:text-cyan-300 transition">تصحيح في النهاية (وضع الاختبار)</p>
                <p className="text-xs text-secondary-400 mt-1">إظهار الإجابات الصحيحة والشروح والنتيجة بعد الانتهاء من جميع الأسئلة.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition">
              <input type="radio" name="feedbackType" checked={immediateFeedback} onChange={() => setImmediateFeedback(true)} className="mt-1 w-4 h-4 text-cyan-500 focus:ring-cyan-500 bg-secondary-900 border-secondary-600" />
              <div>
                <p className="text-white font-medium group-hover:text-cyan-300 transition">تصحيح فوري (وضع التعلم)</p>
                <p className="text-xs text-secondary-400 mt-1">تأكيد كل إجابة وإظهار صحتها مع الشرح التوضيحي فوراً لغرض المراجعة.</p>
              </div>
            </label>
          </div>

          <div className="pt-4">
            <button onClick={() => setHasStarted(true)} className="btn-primary w-full sm:max-w-sm mx-auto flex justify-center items-center gap-2 py-3.5 sm:py-4 text-base sm:text-lg">
              <Play className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>ابدأ الاختبار الآن</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-24">
        <button onClick={() => navigate('/exam/saved')} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>العودة للاختبارات</span>
        </button>

        <div className="glass-card text-center p-8 sm:p-12">
          <h2 className="text-3xl font-bold text-white mb-3">النتيجة النهائية</h2>
          <p className="text-secondary-400 mb-5">لقد أكملت اختبار: {test.title}</p>
          <div className="text-6xl font-black gradient-text mb-3">{score} / {test.questions.length}</div>
          <p className="text-secondary-300 font-medium mb-6">
            {score === test.questions.length ? 'أداء مثالي! أحسنت صنعاً.' : 'أداء جيد، يمكنك المحاولة مرة أخرى لتحسين النتيجة.'}
          </p>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => rateTest(star)}
                className="p-1 rounded-lg hover:scale-110 transition"
                aria-label={`تقييم ${star} من 5`}
              >
                <Star
                  className={`w-8 h-8 ${star <= (test.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-secondary-500'}`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs text-secondary-400">تقييم الاختبار</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white px-2">مراجعة الإجابات</h3>
          {test.questions.map((q, i) => {
            const userAnswer = selectedAnswers[q.id];
            const isEssay = q.type === 'essay';
            const isCorrect = isEssay ? null : userAnswer === q.correctAnswer;
            const correctAnswers = q.correctAnswers && q.correctAnswers.length > 0 ? q.correctAnswers : (q.correctAnswer ? [q.correctAnswer] : []);
            const borderClass = isEssay ? 'border-r-yellow-500' : (isCorrect ? 'border-r-green-500' : 'border-r-red-500');
            return (
              <div key={q.id} className={cn('glass-card border-r-4', borderClass)}>
                <div className="flex items-start gap-4">
                  {isEssay ? <span className="mt-1 text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-1 rounded-lg">مقالي</span> : (isCorrect ? <CheckCircle2 className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" /> : <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />)}
                  <div>
                    <h4 className="text-white font-medium mb-2">السؤال {i + 1}: {q.text}</h4>
                    <p className="text-sm text-secondary-300 mb-1">
                      إجابتك: <span className="text-white font-bold">{userAnswer || '(تم التخطي)'}</span>
                    </p>
                    {isEssay && correctAnswers.length > 0 && (
                      <div className="mt-2 p-3 rounded-lg border border-secondary-700 bg-secondary-800/50">
                        <p className="text-xs text-secondary-400 mb-1">الإجابة الصحيحة / الحل</p>
                        <p className="text-sm text-green-300">{correctAnswers.join(' / ')}</p>
                      </div>
                    )}
                    {!isEssay && !isCorrect && (
                      <p className="text-sm text-secondary-300 text-green-400">الإجابة الصحيحة: {q.correctAnswer}</p>
                    )}
                    {q.explanation && test.settings.showExplanations && (
                      <div className="mt-3 bg-secondary-800/50 p-4 rounded-lg border border-secondary-700">
                        <span className="text-primary-400 font-bold text-sm block mb-1">الشرح:</span>
                        <span className="text-secondary-300 text-sm">{q.explanation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <button onClick={() => navigate('/exam/saved')} className="text-secondary-400 hover:text-white flex items-center gap-2 mb-6 transition">
        <ArrowLeft className="w-5 h-5" />
        <span>العودة</span>
      </button>

      <div className="flex items-center justify-between font-medium text-secondary-300 px-2 lg:px-0">
        <span>السؤال {currentIdx + 1} من {test.questions.length}</span>
        {timeLeft !== null && (
          <span className={cn('font-mono text-lg flex items-center gap-2', timeLeft <= 60 ? 'text-red-400 animate-pulse' : 'text-white')}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </span>
        )}
      </div>

      <div className="flex flex-col xs:flex-row items-center justify-center gap-3 xs:gap-4">
        <button
          onClick={() => { if (currentIdx > 0) setCurrentIdx(currentIdx - 1); }}
          disabled={currentIdx === 0}
          className="w-full xs:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
        >
          <ChevronRight className="w-5 h-5" />
          <span>السؤال السابق</span>
        </button>
        <button
          onClick={() => { if (currentIdx < test.questions.length - 1) setCurrentIdx(currentIdx + 1); }}
          disabled={currentIdx === test.questions.length - 1}
          className="w-full xs:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
        >
          <span>السؤال التالي</span>
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="glass-card" onKeyDown={handleKeyDown} tabIndex={0} autoFocus>
        <h2 className="text-2xl font-bold text-white leading-relaxed mb-2">{currentQ.text}</h2>
        <p className="text-sm text-secondary-400 mb-6">الأسهم للتنقل بين الأسئلة · 1-9 للاختيار · t/f لصح/خطأ · Enter للتأكيد</p>

        <div className="space-y-3">
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
              <button key={i} onClick={() => handleSelect(opt)} disabled={isAnswerRevealed} className={cn('w-full text-right p-4 rounded-xl border transition-all text-white', isAnswerRevealed && 'cursor-default', btnStateClass)}>
                <div className="flex items-center gap-3">
                  <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition',
                    isSelected ? (!isAnswerRevealed ? 'border-primary-500' : (opt === currentQ.correctAnswer ? 'border-green-500' : 'border-red-500')) : 'border-secondary-500',
                    isAnswerRevealed && opt === currentQ.correctAnswer && 'border-green-500')}>
                    {isSelected && <div className={cn('w-2.5 h-2.5 rounded-full', !isAnswerRevealed ? 'bg-primary-500' : (opt === currentQ.correctAnswer ? 'bg-green-500' : 'bg-red-500'))} />}
                    {!isSelected && isAnswerRevealed && opt === currentQ.correctAnswer && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                  </div>
                  <span>{opt}</span>
                </div>
              </button>
            );
          })}

          {currentQ.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-4">
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
                  <button key={val} onClick={() => handleSelect(val)} disabled={isAnswerRevealed} className={cn('w-full text-center p-4 rounded-xl border transition-all text-white font-bold text-lg', isAnswerRevealed && 'cursor-default', btnStateClass)}>
                    {val === 'true' ? 'صح' : 'خطأ'}
                  </button>
                );
              })}
            </div>
          )}

          {currentQ.type === 'essay' && (
            <textarea className="input-field min-h-[150px]" placeholder="اكتب إجابتك هنا..." value={selectedAnswers[currentQ.id] || ''} onChange={(e) => handleSelect(e.target.value)} disabled={isAnswerRevealed} />
          )}
        </div>

        {isAnswerRevealed && (
          <div className={cn('mt-6 p-4 rounded-xl border', isCurrentCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30')}>
            <div className="flex items-start gap-3">
              {isCurrentCorrect ? <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />}
              <div>
                <h4 className={cn('font-bold mb-1', isCurrentCorrect ? 'text-green-400' : 'text-red-400')}>
                  {isCurrentCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}
                </h4>
                {!isCurrentCorrect && currentQ.correctAnswer && currentQ.type !== 'essay' && (
                  <p className="text-sm text-secondary-300 mb-2">الإجابة الصحيحة هي: <span className="font-bold text-white">{currentQ.correctAnswer}</span></p>
                )}
                {test.settings.showExplanations && currentQ.explanation && (
                  <p className="text-secondary-300 text-sm leading-relaxed mt-2 p-3 bg-secondary-900/50 rounded-lg">
                    <strong className="text-secondary-400 ml-1">الشرح:</strong>
                    {currentQ.explanation}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
          <button onClick={handleNext} disabled={!selectedAnswers[currentQ.id] && currentQ.type !== 'essay'} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]">
            {immediateFeedback && !isAnswerRevealed && currentQ.type !== 'essay'
              ? 'تأكيد الإجابة'
              : currentIdx === test.questions.length - 1 ? 'إنهاء الاختبار' : 'السؤال التالي'}
          </button>
        </div>
      </div>
    </div>
  );
}
