import { Link } from 'react-router-dom';
import { Brain, CheckSquare, Share2, Trophy, FolderOpen, Sparkles, Copy, Check } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { TestsShowcaseCard } from './TestsShowcaseCard';
import { ScrollShowcase } from './ScrollShowcase';
import { useState, useEffect, useCallback } from 'react';

const AiGenerationMockup = () => {
  const [progress, setProgress] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 10;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) return;
    const questionInterval = setInterval(() => {
      setCurrentQuestion(prev => {
        if (prev >= totalQuestions) return totalQuestions;
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(questionInterval);
  }, [progress]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
        <span className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-zinc-500" />
          جاري التوليد...
        </span>
        <span className="text-zinc-600">سؤال {Math.min(currentQuestion, totalQuestions)} / {totalQuestions}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {progress >= 100 ? (
        <div className="border border-emerald-500/20 rounded-md p-3 bg-emerald-500/5">
          <div className="text-sm text-emerald-400 font-medium mb-2">تم إنشاء الاختبار بنجاح!</div>
          <div className="text-xs text-zinc-500">{totalQuestions} أسئلة متنوعة جاهزة</div>
        </div>
      ) : (
        <div className="border border-white/10 rounded-md p-4 space-y-3">
          <div className="text-sm text-zinc-400 font-medium">ما هو ناتج 5 × 12 ؟</div>
          <div className="grid grid-cols-2 gap-2">
            {['40', '45', '50', '55'].map((opt, i) => (
              <div
                key={i}
                className={`text-sm p-2.5 rounded-md border transition-all duration-200 ${
                  i === 0 && progress > 50
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-transparent border-white/10 text-zinc-600'
                }`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const QuestionTypesMockup = () => {
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const questionTypes = [
    { label: 'اختيار من متعدد' },
    { label: 'صح / خطأ' },
    { label: 'سؤال مقالي' },
  ];

  return (
    <div className="flex flex-col gap-2">
      {questionTypes.map((type, i) => (
        <button
          key={i}
          onClick={() => setSelectedType(i)}
          className={`flex items-center gap-3 p-3 rounded-md border transition-all duration-200 text-start ${
            selectedType === i
              ? 'bg-indigo-500/10 border-indigo-500/30'
              : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
          }`}
        >
          <div className={`w-7 h-7 rounded-[5px] flex items-center justify-center flex-shrink-0 transition-colors ${
            selectedType === i
              ? 'bg-indigo-500/20 text-indigo-400'
              : 'bg-white/[0.04] border border-white/10 text-zinc-600'
          }`}>
            <CheckSquare size={14} />
          </div>
          <span className={`text-sm transition-colors ${selectedType === i ? 'text-zinc-200' : 'text-zinc-500'}`}>
            {type.label}
          </span>
        </button>
      ))}
    </div>
  );
};

const ResultsMockup = () => {
  const [score, setScore] = useState(0);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        setScore(current);
        if (current >= 8) {
          clearInterval(interval);
          setTimeout(() => setShowStats(true), 300);
        }
      }, 80);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-[#131315]"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path
            className="text-indigo-500"
            strokeDasharray={`${score * 10}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-semibold text-zinc-300 tracking-[-0.02em]">
            {score}<span className="text-base text-zinc-600">/10</span>
          </span>
        </div>
      </div>
      <div className={`flex gap-6 text-center transition-all duration-500 ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        <div>
          <div className="text-xl font-semibold text-zinc-400 tabular-nums">45</div>
          <div className="text-xs text-zinc-600 uppercase tracking-wider">ثانية</div>
        </div>
        <div>
          <div className="text-xl font-semibold text-zinc-400 tabular-nums">2</div>
          <div className="text-xs text-zinc-600 uppercase tracking-wider">أخطاء</div>
        </div>
      </div>
    </div>
  );
};

const ShareMockup = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2 space-x-reverse">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-white/5 border-2 border-white/10 transition-transform hover:scale-110 hover:z-10"
            />
          ))}
        </div>
        <span className="text-xs text-zinc-500">+12 زميل انضم للاختبار</span>
      </div>
      <div className="bg-[#0a0a0c] border border-[#131315] rounded-md p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Share2 size={13} className="text-zinc-600 flex-shrink-0" />
          <span className="text-xs text-zinc-500 truncate">svu.community/exam/shared</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all duration-200 ${
            copied
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-white/[0.04] text-zinc-500 border border-white/10 hover:bg-white/[0.06] hover:text-zinc-400'
          }`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'تم النسخ!' : 'نسخ'}
        </button>
      </div>
      <div className="text-xs text-zinc-600 text-center">شارك الرابط واجمع نقاط التنافس</div>
    </div>
  );
};

const BrowseMockup = () => {
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const tests = [
    { title: 'مقدمة في البرمجة', questions: 25, rating: 4.8 },
    { title: 'أساسيات الشبكات', questions: 18, rating: 4.5 },
    { title: 'قواعد البيانات', questions: 30, rating: 4.9 },
    { title: 'هندسة البرمجيات', questions: 22, rating: 4.7 },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {tests.map((test, i) => (
        <button
          key={i}
          onClick={() => setSelectedTest(i)}
          className={`text-start p-2.5 rounded-md border transition-all duration-200 ${
            selectedTest === i
              ? 'bg-indigo-500/10 border-indigo-500/30'
              : 'bg-[#0a0a0c] border-[#131315] hover:border-[#1a1a1e]'
          }`}
        >
          <div className={`text-sm font-medium mb-1 truncate transition-colors ${selectedTest === i ? 'text-indigo-300' : 'text-zinc-400'}`}>
            {test.title}
          </div>
          <div className="text-xs text-zinc-600 mb-1.5">{test.questions} سؤال</div>
          <div className="flex items-center gap-1">
            <Trophy size={10} className={selectedTest === i ? 'text-indigo-400' : 'text-zinc-600'} />
            <span className={`text-xs transition-colors ${selectedTest === i ? 'text-indigo-400' : 'text-zinc-600'}`}>
              {test.rating}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export const TestsFeatureSection = () => (
  <section dir="rtl" className="relative">
    <div className="relative z-10 pt-20 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          badge={
            <>
              <span className="w-1 h-1 rounded-full bg-zinc-500" />
              متاح الآن
            </>
          }
          title="الاختبارات التفاعلية"
          description="أنشئ اختبارات ذكية بالذكاء الاصطناعي، شاركها مع زملائك، وتنافس على أفضل النتائج — كل هذا داخل المنصة مباشرة."
          action={
            <Link
              to="/exam/browse"
              className="inline-flex items-center gap-2 mt-6 bg-white/[0.04] border border-[#1a1a1e] hover:bg-white/[0.06] hover:border-[#2a2a2e] text-zinc-400 hover:text-zinc-300 font-medium text-sm py-2.5 px-6 rounded-md transition-all duration-150"
            >
              استكشف الاختبارات
              <Brain size={16} />
            </Link>
          }
        />
      </div>
    </div>

    <ScrollShowcase>
      <TestsShowcaseCard icon={<Brain size={20} />} title="توليد ذكي بالذكاء الاصطناعي" description="ارفع صورة من كتابك أو اكتب الموضوع، ويتولى الذكاء الاصطناعي إنشاء اختبار كامل بأسئلة متنوعة في ثوانٍ." mockup={<AiGenerationMockup />} />
      <TestsShowcaseCard icon={<CheckSquare size={20} />} title="أنواع أسئلة متعددة" description="اختيار من متعدد، صح/خطأ، أو مقالية — اختر النوع المناسب لكل سؤال." mockup={<QuestionTypesMockup />} />
      <TestsShowcaseCard icon={<Trophy size={20} />} title="نتائج فورية ولوحة متصدرين" description="احصل على نتيجتك فورياً مع شرح لكل إجابة، وتابع ترتيبك بين الزملاء." mockup={<ResultsMockup />} />
      <TestsShowcaseCard icon={<Share2 size={20} />} title="مشاركة وتنافس" description="شارك اختباراتك برابط مباشر، واجمع زملاءك للتنافس على أفضل النتائج." mockup={<ShareMockup />} />
      <TestsShowcaseCard icon={<FolderOpen size={20} />} title="تصفح اختبارات منشورة" description="استكشف مئات الاختبارات المنشورة من الطلاب والمعلمين في جميع المواد." mockup={<BrowseMockup />} />
    </ScrollShowcase>
  </section>
);
