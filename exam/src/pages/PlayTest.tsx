import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTestById } from '../lib/store';
import { TestModel } from '../types';
import { ArrowLeft, CheckCircle2, XCircle, Play, Settings2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { ErrorState } from '../components/ErrorState';
import { PlayTestSkeleton } from '../components/Skeletons';

export default function PlayTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<TestModel | null>(null);
  
  // Async status
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Test Options
  const [hasStarted, setHasStarted] = useState(false);
  const [immediateFeedback, setImmediateFeedback] = useState(false);

  // Play State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const fetchTestDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        // TODO(Integration): استبدال بجلب من قاعدة البيانات الفعلية
        await new Promise(resolve => setTimeout(resolve, 600));
        const found = getTestById(id);
        if (found) {
          setTest(found);
        } else {
          setError('عذراً، لم يتم العثور على هذا الاختبار. ربما تم حذفه أو أن الرابط غير صحيح.');
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل بيانات الاختبار.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestDetails();
  }, [id, navigate]);

  useEffect(() => {
    if (hasStarted && test?.settings.globalTimeLimitMinutes && timeLeft === null) {
      setTimeLeft(test.settings.globalTimeLimitMinutes * 60);
    }
  }, [hasStarted, test, timeLeft]);

  useEffect(() => {
    if (!hasStarted || showResults || timeLeft === null) return;
    
    if (timeLeft <= 0) {
      setShowResults(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev !== null ? prev - 1 : null);
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, showResults, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <PlayTestSkeleton />;
  if (error) return <ErrorState title="تعذر تحميل الاختبار" message={error} onRetry={() => navigate('/saved')} />;
  if (!test) return null;

  const currentQ = test.questions[currentIdx];

  const handleSelect = (answer: string) => {
    if (!isAnswerRevealed) {
      setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: answer }));
    }
  };

  const handleNext = () => {
    // If in learning mode and haven't revealed answer yet (and not an essay question which can't be auto-graded)
    if (immediateFeedback && !isAnswerRevealed && currentQ.type !== 'essay') {
      setIsAnswerRevealed(true);
      return;
    }

    setIsAnswerRevealed(false);
    if (currentIdx < test.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowResults(true);
    }
  };

  if (!hasStarted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animation-fade-in-up">
         <button onClick={() => navigate('/saved')} className="text-secondary-400 hover:text-white flex items-center gap-2 mb-6 transition">
            <ArrowLeft className="w-5 h-5 r" />
            <span>العودة</span>
         </button>
         
         <div className="glass-card p-8 md:p-12 text-center space-y-6">
            <h1 className="text-3xl font-bold text-white mb-2">{test.title}</h1>
            {test.description && <p className="text-secondary-300">{test.description}</p>}
            
            <div className="flex flex-wrap justify-center gap-6 py-6 border-y border-white/10">
               <div className="text-center px-4">
                 <p className="text-secondary-400 text-sm mb-1">الأسئلة</p>
                 <p className="text-xl font-bold text-white">{test.questions.length}</p>
               </div>
               <div className="text-center px-4">
                 <p className="text-secondary-400 text-sm mb-1">الشروحات المرفقة</p>
                 <p className="text-xl font-bold text-white">{test.settings.showExplanations ? 'متوفرة' : 'غير متوفرة'}</p>
               </div>
               {test.settings.globalTimeLimitMinutes ? (
                 <div className="text-center px-4">
                   <p className="text-secondary-400 text-sm mb-1">الوقت المخصص</p>
                   <p className="text-xl font-bold text-white">{test.settings.globalTimeLimitMinutes} دقيقة</p>
                 </div>
               ) : null}
            </div>

            <div className="text-right space-y-4 max-w-sm mx-auto bg-secondary-800/50 p-6 rounded-2xl border border-secondary-700/50">
               <div className="flex items-center gap-2 text-white font-medium mb-4">
                 <Settings2 className="w-5 h-5 text-primary-400" />
                 <h3>إعدادات بدء الاختبار</h3>
               </div>
               
               <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="feedbackType"
                    checked={!immediateFeedback}
                    onChange={() => setImmediateFeedback(false)}
                    className="mt-1 w-4 h-4 text-primary-500 focus:ring-primary-500 bg-secondary-900 border-secondary-600"
                  />
                  <div>
                    <p className="text-white font-medium group-hover:text-primary-300 transition">تصحيح في النهاية (وضع الاختبار)</p>
                    <p className="text-xs text-secondary-400 mt-1">إظهار الإجابات الصحيحة والشروح والنتيجة بعد الانتهاء من جميع الأسئلة.</p>
                  </div>
               </label>

               <label className="flex items-start gap-3 cursor-pointer group mt-4">
                  <input 
                    type="radio" 
                    name="feedbackType"
                    checked={immediateFeedback}
                    onChange={() => setImmediateFeedback(true)}
                    className="mt-1 w-4 h-4 text-primary-500 focus:ring-primary-500 bg-secondary-900 border-secondary-600"
                  />
                  <div>
                    <p className="text-white font-medium group-hover:text-primary-300 transition">تصحيح فوري (وضع التعلم)</p>
                    <p className="text-xs text-secondary-400 mt-1">تأكيد كل إجابة وإظهار صحتها مع الشرح التوضيحي فوراً لغرض المراجعة.</p>
                  </div>
               </label>
            </div>

            <div className="pt-4">
              <button 
                onClick={() => setHasStarted(true)} 
                className="btn-primary w-full max-w-sm mx-auto flex justify-center items-center gap-2 py-4 text-lg"
              >
                <Play className="w-6 h-6" />
                <span>ابدأ الاختبار الآن</span>
              </button>
            </div>
         </div>
      </div>
    );
  }

  if (showResults) {
    let score = 0;
    test.questions.forEach(q => {
      const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
      if (isCorrect) score++;
    });

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="glass-card text-center p-12">
          <h2 className="text-3xl font-bold text-white mb-2">النتيجة النهائية</h2>
          <p className="text-secondary-400 mb-8">لقد أكملت اختبار: {test.title}</p>
          <div className="text-6xl font-black gradient-text mb-2">
             {score} / {test.questions.length}
          </div>
          <p className="text-secondary-300 font-medium mb-8">
            {score === test.questions.length ? 'أداء مثالي! أحسنت صنعاً.' : 'أداء جيد، يمكنك المحاولة مرة أخرى لتحسين النتيجة.'}
          </p>
          
          <button onClick={() => navigate('/saved')} className="btn-primary">العودة للاختبارات</button>
        </div>

        {/* Breakdown */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white px-2">مراجعة الإجابات</h3>
          {test.questions.map((q, i) => {
            const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
            const answered = selectedAnswers[q.id] !== undefined;

            return (
              <div key={q.id} className={cn("glass-card border-l-4", isCorrect ? "border-l-green-500" : "border-l-red-500")}>
                 <div className="flex items-start gap-4">
                    {isCorrect ? <CheckCircle2 className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" /> : <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />}
                    <div>
                      <h4 className="text-white font-medium mb-2">السؤال {i + 1}: {q.text}</h4>
                      <p className="text-sm text-secondary-300 mb-1">
                        إجابتك: <span className={isCorrect ? "text-green-400" : "text-red-400 font-bold"}>{selectedAnswers[q.id] || '(تم التخطي)'}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-secondary-300 text-green-400">الإجابة الصحيحة: {q.correctAnswer}</p>
                      )}
                      
                      {q.explanation && test.settings.showExplanations && (
                        <div className="mt-4 bg-secondary-800/50 p-4 rounded-lg border border-secondary-700">
                           <span className="text-primary-400 font-bold text-sm block mb-1">الشرح التوضيحي:</span>
                           <span className="text-secondary-300 text-sm">{q.explanation}</span>
                        </div>
                      )}
                    </div>
                 </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  }

  const isCurrentCorrect = selectedAnswers[currentQ.id] === currentQ.correctAnswer;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <button onClick={() => navigate('/saved')} className="text-secondary-400 hover:text-white flex items-center gap-2 mb-6 transition">
          <ArrowLeft className="w-5 h-5 r" />
          <span>العودة</span>
       </button>

       <div className="flex items-center justify-between font-medium text-secondary-300 px-2 lg:px-0">
         <span>السؤال {currentIdx + 1} من {test.questions.length}</span>
         {timeLeft !== null && (
           <span className={cn("font-mono text-lg flex items-center gap-2", timeLeft <= 60 ? "text-red-400 animate-pulse" : "text-white")}>
             <Clock className="w-5 h-5" />
             {formatTime(timeLeft)}
           </span>
         )}
       </div>

       <div className="glass-card">
          <h2 className="text-2xl font-bold text-white leading-relaxed mb-8">{currentQ.text}</h2>

          <div className="space-y-3">
             {currentQ.type === 'multiple_choice' && currentQ.options?.map((opt, i) => {
                const isSelected = selectedAnswers[currentQ.id] === opt;
                let btnStateClass = "bg-secondary-800 border-secondary-700 hover:border-secondary-500";
                
                if (isAnswerRevealed) {
                    const isCorrectOption = opt === currentQ.correctAnswer;
                    if (isCorrectOption) {
                       btnStateClass = "bg-green-500/20 border-green-500 text-green-400 ring-2 ring-green-500";
                    } else if (isSelected) {
                       btnStateClass = "bg-red-500/20 border-red-500 text-red-400";
                    } else {
                       btnStateClass = "bg-secondary-800/50 border-secondary-800 opacity-50";
                    }
                } else if (isSelected) {
                    btnStateClass = "bg-primary-500/20 border-primary-500 shadow-[0_0_0_2px_rgba(14,165,233,0.2)]";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(opt)}
                    disabled={isAnswerRevealed}
                    className={cn(
                      "w-full text-right p-4 rounded-xl border transition-all text-white",
                      isAnswerRevealed && "cursor-default",
                      btnStateClass
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition",
                        isSelected ? (!isAnswerRevealed ? "border-primary-500" : (opt === currentQ.correctAnswer ? "border-green-500" : "border-red-500")) : "border-secondary-500",
                        isAnswerRevealed && opt === currentQ.correctAnswer && "border-green-500"
                      )}>
                         {isSelected && <div className={cn("w-2.5 h-2.5 rounded-full", !isAnswerRevealed ? "bg-primary-500" : (opt === currentQ.correctAnswer ? "bg-green-500" : "bg-red-500"))} />}
                         {!isSelected && isAnswerRevealed && opt === currentQ.correctAnswer && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                      </div>
                      <span>{opt}</span>
                    </div>
                  </button>
                )
             })}

             {currentQ.type === 'true_false' && (
               <div className="grid grid-cols-2 gap-4">
                 {['true', 'false'].map((val) => {
                   const isSelected = selectedAnswers[currentQ.id] === val;
                   let btnStateClass = "bg-secondary-800 border-secondary-700 hover:border-secondary-500";
                  
                   if (isAnswerRevealed) {
                       const isCorrectOption = val === currentQ.correctAnswer?.toLowerCase();
                       if (isCorrectOption) {
                          btnStateClass = "bg-green-500/20 border-green-500 text-green-400 ring-2 ring-green-500";
                       } else if (isSelected) {
                          btnStateClass = "bg-red-500/20 border-red-500 text-red-400";
                       } else {
                          btnStateClass = "bg-secondary-800/50 border-secondary-800 opacity-50";
                       }
                   } else if (isSelected) {
                       btnStateClass = "bg-primary-500/20 border-primary-500 shadow-[0_0_0_2px_rgba(14,165,233,0.2)]";
                   }

                   return (
                     <button
                       key={val}
                       onClick={() => handleSelect(val)}
                       disabled={isAnswerRevealed}
                       className={cn(
                         "w-full text-center p-4 rounded-xl border transition-all text-white font-bold text-lg",
                         isAnswerRevealed && "cursor-default",
                         btnStateClass
                       )}
                     >
                       {val === 'true' ? 'صح' : 'خطأ'}
                     </button>
                   )
                 })}
               </div>
             )}

             {currentQ.type === 'essay' && (
               <textarea 
                 className="input-field min-h-[150px]" 
                 placeholder="اكتب إجابتك هنا..."
                 value={selectedAnswers[currentQ.id] || ''}
                 onChange={(e) => handleSelect(e.target.value)}
                 disabled={isAnswerRevealed}
               />
             )}
          </div>

          {isAnswerRevealed && (
            <div className={cn("mt-6 p-4 rounded-xl border", isCurrentCorrect ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30")}>
               <div className="flex items-start gap-3">
                 {isCurrentCorrect ? <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 mt-0.5 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />}
                 <div>
                   <h4 className={cn("font-bold mb-1", isCurrentCorrect ? "text-green-400" : "text-red-400")}>
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
             <button 
               onClick={handleNext}
               disabled={!selectedAnswers[currentQ.id] && currentQ.type !== 'essay'}
               className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
             >
               {immediateFeedback && !isAnswerRevealed && currentQ.type !== 'essay' 
                 ? 'تأكيد الإجابة' 
                 : (currentIdx === test.questions.length - 1 ? 'إنهاء الاختبار' : 'السؤال التالي')
               }
             </button>
          </div>
       </div>
    </div>
  )
}
