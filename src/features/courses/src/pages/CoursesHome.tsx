import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Info,
  Lightbulb,
  Trash2,
  Save,
  X,
  Zap,
  GraduationCap,
  Monitor,
  FileText,
  User,
  Code2,
  Calculator,
  Atom,
  CircuitBoard,
  Database,
  Brain,
  Globe,
  Cpu,
  Signal,
  Network,
  Server,
  Terminal,
  Briefcase,
  FolderOpen,
  Smartphone,
  Workflow,
  Binary,
  Shield,
  Scale,
  Image,
  Boxes,
  BookOpen,
  Languages,
  MessageSquare,
  CalendarDays,
  BookMarked,
} from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { coursesDB, promotionThresholds, yearNames } from '../data/coursesData';
import type { Course } from '../types';
import { Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Icon } from '@/src/components/ui/Icon';
import { useAuth } from '@/src/contexts/AuthContext';
import { useCurrentSemesterCourses } from '@/src/features/schedule-extraction/hooks/useCurrentSemesterCourses';
import { CourseSuggestionCard } from '@/src/features/schedule-extraction/components/CourseSuggestionCard';

export function CoursesHome() {
  const {
    passedCourses,
    carriedCourses,
    currentCart,
    totalEarnedCredits,
    currentSemesterHours,
    modal,
    celebration,
    toggleCourse,
    openFinishModal,
    saveSemesterData,
    convertToPassed,
    removeCourse,
    resetData,
    closeModal,
    getCourseStatus,
    getYearFromCredits,
  } = useCourses();

  const { session: _session } = useAuth();
  const [activeTab, setActiveTab] = useState<'plan' | 'current'>('plan');

  const { data: currentSemesterCourses, isLoading: isLoadingSemester, error: semesterError } =
    useCurrentSemesterCourses();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [finishStatuses, setFinishStatuses] = useState<Record<string, 'passed' | 'carried'>>({});

  const currentYear = useMemo(() => getYearFromCredits(totalEarnedCredits), [totalEarnedCredits, getYearFromCredits]);
  const nextTarget = useMemo(
    () => promotionThresholds.find(t => totalEarnedCredits < t.credits) || promotionThresholds[promotionThresholds.length - 1],
    [totalEarnedCredits]
  );

  const progress = useMemo(() => {
    if (totalEarnedCredits >= 260) return 100;
    const prevThreshold = nextTarget === promotionThresholds[0] ? 0 : promotionThresholds[promotionThresholds.indexOf(nextTarget) - 1].credits;
    return Math.min(((totalEarnedCredits - prevThreshold) / (nextTarget.credits - prevThreshold)) * 100, 100);
  }, [totalEarnedCredits, nextTarget]);

  const levels = useMemo(() => {
    const grouped: Record<number, (Course & { id: string })[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    const english: (Course & { id: string })[] = [];
    for (const id in coursesDB) {
      const course = { ...coursesDB[id], id };
      if (course.level === 'ENG') {
        english.push(course);
      } else if (grouped[course.level as number]) {
        grouped[course.level as number].push(course);
      }
    }
    return { ...grouped, ENG: english };
  }, []);

  const hoursValid = currentSemesterHours >= 16 && currentSemesterHours <= 36;

  const courseIconMap: Record<string, typeof Code2> = {
    Code2,
    Calculator,
    Atom,
    CircuitBoard,
    Database,
    Brain,
    Globe,
    Cpu,
    Signal,
    Network,
    Server,
    Terminal,
    Briefcase,
    FolderOpen,
    Smartphone,
    Workflow,
    Binary,
    Shield,
    Scale,
    Image,
    Boxes,
    BookOpen,
    Languages,
    MessageSquare,
    Monitor,
    GraduationCap,
  };

  const defaultCourseIcon = BookOpen;

  const handleCourseClick = (id: string) => {
    toggleCourse(id);
  };

  const handleInfoClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedCourseId(id);
  };

  const handleFinishClick = () => {
    const statuses: Record<string, 'passed' | 'carried'> = {};
    currentCart.forEach(id => {
      statuses[id] = finishStatuses[id] || 'passed';
    });
    saveSemesterData(statuses);
    setFinishStatuses({});
  };

  const selectedCourse = selectedCourseId ? coursesDB[selectedCourseId] : null;

  return (
    <div className="max-w-7xl mx-auto pb-32">
      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] pointer-events-none"
          >
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-0 w-8 h-10 rounded-full"
                style={{
                  left: `${Math.random() * 100}vw`,
                  backgroundColor: `hsl(${Math.random() * 360}, 80%, 55%)`,
                }}
                animate={{
                  y: [-100, -window.innerHeight],
                  rotate: [0, Math.random() * 40 - 20],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: Math.random() * 2 + 3,
                  ease: 'easeOut',
                }}
              />
            ))}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="fixed inset-0 flex items-center justify-center pointer-events-auto"
            >
              <div className="bg-slate-800 border border-orange-500/30 rounded-3xl p-8 max-w-md text-center shadow-2xl">
                <GraduationCap className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-white mb-2">
                  مبارك الترفع للسنة {currentYear}!
                </h2>
                <p className="text-orange-400 font-bold">الله عم ينقيك من الجهل ليصطفيك مهندس...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="text-center py-8 border-b border-white/8 mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">المحاكي   </h1>
        <p className="text-slate-400 font-semibold mb-6">صمم خطتك، تفحص المواد، واحفظ تقدمك بأمان في السحابة</p>

        <div className="bg-orange-500/10 border-r-4 border-orange-500 rounded-xl p-4 max-w-2xl mx-auto mb-6 shadow-lg">
          <div className="flex items-center gap-3">
            <Icon icon={Lightbulb} size="md" className="text-orange-400 flex-shrink-0" />
            <p className="text-slate-300 font-bold text-sm sm:text-base">
              ملاحظة هامة: تنزيل المادة (حتى لو حمل) يفتح المادة اللاحقة. والمادة {"\""}المرفّعة{"\""} فقط هي التي تُحسب بالرصيد!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button
            onClick={resetData}
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
          >
            تصفير الخطة
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto mb-8">
        <Link to="/dashboard/subjects">
          <GlassCard className="cursor-pointer hover:border-orange-500/30 transition-all duration-200 group">
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/20 transition-colors">
                <Icon icon={BookOpen} size="xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white mb-1">المصادر</h2>
                <p className="text-slate-400 text-sm">تصفح جميع المواد الدراسية ومصادرها من اختبارات ومجموعات ومراجع</p>
              </div>
              <Button variant="secondary">
                تصفح المصادر
              </Button>
            </div>
          </GlassCard>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex bg-slate-800/80 border border-white/8 rounded-xl p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'plan'
                ? 'bg-orange-500/15 text-orange-400 shadow-[0_0_12px_rgba(255,126,0,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon icon={BookMarked} size="sm" />
            خطة الدراسة
          </button>
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'current'
                ? 'bg-orange-500/15 text-orange-400 shadow-[0_0_12px_rgba(255,126,0,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon icon={CalendarDays} size="sm" />
            الفصل الحالي
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'current' && (
          <motion.div
            key="current-semester"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-5xl mx-auto mb-8"
          >
            <GlassCard className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                  <Icon icon={CalendarDays} size="lg" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">الفصل الحالي</h2>
                  <p className="text-slate-400 text-xs font-bold">المواد المسجّلة من الجدول extraction</p>
                </div>
              </div>

              {isLoadingSemester && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-10 h-10 border-3 border-orange-500/20 border-t-orange-500 rounded-full"
                  />
                  <p className="text-slate-400 font-bold text-sm">جاري تحميل المواد...</p>
                </div>
              )}

              {semesterError && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-5 text-center">
                  <p className="text-rose-400 font-bold text-sm">حدث خطأ أثناء تحميل المواد</p>
                  <p className="text-slate-400 text-xs mt-1">{semesterError.message}</p>
                </div>
              )}

              {!isLoadingSemester && !semesterError && (!currentSemesterCourses || currentSemesterCourses.length === 0) && (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-700/40 flex items-center justify-center text-slate-500">
                    <Icon icon={BookOpen} size="xl" />
                  </div>
                  <p className="text-slate-400 font-bold text-sm">لا توجد مواد للفصل الحالي</p>
                  <p className="text-slate-500 text-xs">قم بتحميل جدولك الدراسي لرؤية المواد هنا</p>
                </div>
              )}

              {!isLoadingSemester && !semesterError && currentSemesterCourses && currentSemesterCourses.length > 0 && (
                <div className="space-y-3">
                  {currentSemesterCourses.map(course => (
                    <CourseSuggestionCard
                      key={course.id}
                      course={course}
                    />
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeTab === 'plan' && (
          <motion.div
            key="plan-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-slate-800/60 border border-white/8 rounded-2xl p-4 sm:p-6 mb-8 shadow-xl max-w-5xl mx-auto">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <Icon icon={Zap} size="lg" className="text-orange-400" />
                  <span className="text-white font-black text-lg">الرصيد المُنجز:</span>
                  <span className="text-3xl font-black text-orange-400" style={{ textShadow: '0 0 15px rgba(255,126,0,0.4)' }}>
                    {totalEarnedCredits}
                  </span>
                  <small className="text-slate-500 text-xs font-bold hidden sm:inline">نقطة</small>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-black text-sm">التقدم نحو الترفع</span>
                    <span className="text-slate-400 text-xs font-bold">
                      {totalEarnedCredits < 260
                        ? `تحتاج إلى ${nextTarget.credits - totalEarnedCredits} نقطة`
                        : 'مبارك التخرج يا مهندس! 🎓'}
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-900/80 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      className="h-full bg-gradient-to-l from-amber-400 to-orange-500 rounded-full"
                      style={{ boxShadow: '0 0 10px rgba(255,126,0,0.5)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {(Object.entries(levels) as [string, (Course & { id: string })[]][])
                .filter(([key]) => !isNaN(Number(key)))
                .map(([year, courses]) => (
                  <GlassCard key={year} className="p-4 sm:p-5">
                    <h3 className="text-center font-black text-white bg-slate-800 rounded-xl p-3 mb-4 border-b-2 border-orange-500 shadow-lg">
                      {yearNames[Number(year) as keyof typeof yearNames]}
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      {courses.map(course => {
                        const status = getCourseStatus(course.id);
                        const isLocked = status === 'locked';
                        const isCarried = carriedCourses.includes(course.id) && !currentCart.includes(course.id);
                        const CourseIcon = course.icon ? courseIconMap[course.icon] : defaultCourseIcon;

                        return (
                          <motion.div
                            key={course.id}
                            whileHover={!isLocked ? { y: -3 } : undefined}
                            onClick={() => !isLocked && handleCourseClick(course.id)}
                            className={`
                              relative p-3.5 rounded-xl border cursor-pointer transition-all shadow-lg
                              ${isLocked ? 'bg-slate-800/40 opacity-60 border-dashed cursor-not-allowed' : ''}
                              ${status === 'available' ? 'border-r-4 border-cyan-500 bg-slate-800/60' : ''}
                              ${status === 'selected' ? 'border-r-4 border-orange-500 bg-orange-500/10 scale-[1.02] shadow-orange-500/15' : ''}
                              ${status === 'passed' ? 'border-r-4 border-emerald-500 bg-emerald-500/8' : ''}
                              ${status === 'carried' ? 'border-r-4 border-rose-500 bg-rose-500/8' : ''}
                            `}
                          >
                            <button
                              onClick={(e) => handleInfoClick(e, course.id)}
                              className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center z-10 font-bold hover:bg-orange-500 transition-all"
                            >
                              <Icon icon={Info} size="xs" />
                            </button>

                            <div className="flex items-start gap-2.5 pr-9">
                              <div className={`mt-0.5 flex-shrink-0 ${isLocked ? 'text-slate-600' : 'text-orange-400'}`}>
                                <Icon icon={CourseIcon} size="sm" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-extrabold text-white text-sm leading-tight truncate">{course.name}</h3>
                                <div className="flex justify-between items-center mt-1.5 text-xs font-bold text-slate-400">
                                  <span className="direction-ltr">{course.id}</span>
                                  <div className="flex items-center gap-2">
                                    {isCarried && <span className="bg-rose-500 text-white px-2 py-0.5 rounded-md text-[10px] shadow-[0_0_8px_rgba(239,68,68,0.4)]">حمل</span>}
                                    <span className={`px-2 py-1 rounded-lg ${course.isEnglish ? 'text-[10px]' : ''}`}>
                                      {course.earned ? `${course.credits} تنزيل ← ${course.earned} ترفيع` : `${course.credits} نقطة`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </GlassCard>
                ))}
            </div>

            {levels.ENG.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-black text-white border-b-2 border-orange-500 inline-block pb-1 mb-4">🇬🇧 مسار اللغة الإنجليزية</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-orange-500/3 border border-dashed border-orange-500/20 rounded-2xl p-4">
                  {levels.ENG.map(course => {
                    const status = getCourseStatus(course.id);
                    const isLocked = status === 'locked';
                    const isCarried = carriedCourses.includes(course.id) && !currentCart.includes(course.id);
                    const CourseIcon = course.icon ? courseIconMap[course.icon] : defaultCourseIcon;

                    return (
                      <motion.div
                        key={course.id}
                        whileHover={!isLocked ? { y: -3 } : undefined}
                        onClick={() => !isLocked && handleCourseClick(course.id)}
                        className={`
                          relative p-3.5 rounded-xl border cursor-pointer transition-all shadow-lg
                          ${isLocked ? 'bg-slate-800/40 opacity-60 border-dashed cursor-not-allowed' : ''}
                          ${status === 'available' ? 'border-r-4 border-cyan-500 bg-slate-800/60' : ''}
                          ${status === 'selected' ? 'border-r-4 border-orange-500 bg-orange-500/10 scale-[1.02]' : ''}
                          ${status === 'passed' ? 'border-r-4 border-emerald-500 bg-emerald-500/8' : ''}
                          ${status === 'carried' ? 'border-r-4 border-rose-500 bg-rose-500/8' : ''}
                        `}
                      >
                        <button
                          onClick={(e) => handleInfoClick(e, course.id)}
                          className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center z-10 font-bold hover:bg-orange-500 transition-all"
                        >
                          <Icon icon={Info} size="xs" />
                        </button>

                        <div className="flex items-start gap-2.5 pr-9">
                          <div className={`mt-0.5 flex-shrink-0 ${isLocked ? 'text-slate-600' : 'text-orange-400'}`}>
                            <Icon icon={CourseIcon} size="sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-white text-sm leading-tight truncate">{course.name}</h3>
                            <div className="flex justify-between items-center mt-1.5 text-xs font-bold text-slate-400">
                              <span className="direction-ltr">{course.id}</span>
                              <div className="flex items-center gap-2">
                                {isCarried && <span className="bg-rose-500 text-white px-2 py-0.5 rounded-md text-[10px]">حمل</span>}
                                <span className="text-[10px]">{course.credits} تنزيل ← {course.earned} ترفيع</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'plan' && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-white/5 z-40 shadow-[0_-5px_25px_rgba(0,0,0,0.3)]"
          dir="rtl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Icon icon={Zap} size="lg" className="text-orange-400" />
              <span className="text-white font-black text-lg">عبء التنزيل الحالي:</span>
              <span className={`px-4 py-1.5 rounded-xl text-xl font-black ${hoursValid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/10 text-white border border-white/10'}`}>
                {currentSemesterHours}
              </span>
              <small className="text-slate-500 text-xs font-bold hidden sm:inline">(مسموح 16 - 36)</small>
            </div>

            <Button
              onClick={openFinishModal}
              disabled={!hoursValid || currentCart.length === 0}
              variant="primary"
              icon={<Save className="w-5 h-5" />}
              className="text-lg"
            >
              تثبيت مواد الفصل
            </Button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-slate-800 border border-orange-500/20 rounded-3xl w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto ${modal.isAlert ? 'text-center' : ''}`}
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-black text-white">{modal.title}</h2>
                  <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {modal.title === 'حالة مواد الفصل' && (
                  <div className="space-y-3">
                     {currentCart.map(id => {
                       const course = coursesDB[id];
                       if (!course) return null;
                       const status = finishStatuses[id] || 'passed';
                       return (
                         <div
                           key={id}
                           className="flex justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-white/5"
                         >
                           <span className="text-white font-bold">{course.name}</span>
                           <select
                             value={status}
                             onChange={(e) => setFinishStatuses(prev => ({ ...prev, [id]: e.target.value as 'passed' | 'carried' }))}
                             className="px-3 py-2 rounded-lg bg-slate-900 text-white border border-white/10 font-bold text-sm outline-none"
                           >
                             <option value="passed">✅ ناجح</option>
                             <option value="carried">⚠️ حمل</option>
                           </select>
                         </div>
                       );
                     })}
                    <Button
                      onClick={handleFinishClick}
                      variant="primary"
                      className="w-full"
                    >
                      حفظ التقدم
                    </Button>
                    <Button
                      onClick={closeModal}
                      variant="secondary"
                      className="w-full"
                    >
                      إلغاء
                    </Button>
                  </div>
                )}

                {modal.title === 'تعديل حالة المادة' && selectedCourseId && coursesDB[selectedCourseId] && (
                  <div className="space-y-4">
                    <p className="text-slate-300 font-semibold leading-relaxed">
                      المادة <span className="text-white font-black">{coursesDB[selectedCourseId].name}</span>
                      {passedCourses.includes(selectedCourseId) ? ' مرفّعة. هل تريد إزالتها؟' : ' (حمل). هل قمت بترفيعها الآن؟'}
                    </p>
                    {!passedCourses.includes(selectedCourseId) && (
                      <Button
                        onClick={() => convertToPassed(selectedCourseId)}
                        variant="primary"
                        className="w-full"
                      >
                        نعم، تم الترفيع 🎉
                      </Button>
                    )}
                    <Button
                      onClick={() => removeCourse(selectedCourseId)}
                      variant="danger"
                      className="w-full"
                    >
                      {passedCourses.includes(selectedCourseId) ? 'إزالة المادة' : 'إزالة المادة نهائياً'}
                    </Button>
                    <Button
                      onClick={closeModal}
                      variant="secondary"
                      className="w-full"
                    >
                      إلغاء
                    </Button>
                  </div>
                )}

                {modal.isAlert && modal.title !== 'حالة مواد الفصل' && modal.title !== 'تعديل حالة المادة' && (
                  <div className="space-y-4">
                    <p className="text-slate-300 font-semibold leading-relaxed whitespace-pre-line">{modal.content}</p>
                    <Button
                      onClick={closeModal}
                      variant="primary"
                      className="w-full"
                    >
                      حسناً
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCourseId && selectedCourse && selectedCourseId !== 'about' && !modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCourseId(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-orange-500/20 rounded-3xl w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-white">{selectedCourse.name}</h2>
                  <button onClick={() => setSelectedCourseId(null)} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {selectedCourse.isEnglish ? (
                  <div className="space-y-4">
                    <p className="text-orange-400 font-bold">1 نقطة تنزيل تعطي 3 ترفيع.</p>
                    <table className="w-full border-collapse text-center text-white bg-slate-900/40 rounded-xl overflow-hidden">
                      <thead>
                        <tr>
                          <th className="p-3 bg-white/10 font-bold">المستوى</th>
                          <th className="p-3 bg-white/10 font-bold">العلامة</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="p-3 border-b border-white/5">2</td><td className="p-3 border-b border-white/5">36%</td></tr>
                        <tr><td className="p-3 border-b border-white/5">3</td><td className="p-3 border-b border-white/5">56%</td></tr>
                        <tr><td className="p-3 border-b border-white/5">4</td><td className="p-3 border-b border-white/5">74%</td></tr>
                        <tr><td className="p-3">إعفاء</td><td className="p-3">96%+</td></tr>
                      </tbody>
                    </table>
                    <Button
                      onClick={() => setSelectedCourseId(null)}
                      variant="primary"
                      className="w-full"
                    >
                      إغلاق النافذة
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedCourse.info && (
                      <>
                        <div className="flex items-start gap-3 pb-3 border-b border-white/5">
                          <Icon icon={Info} size="md" className="text-orange-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-slate-400 font-bold text-sm block">لمحة:</span>
                            <span className="text-white font-bold">{selectedCourse.info.over}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 pb-3 border-b border-white/5">
                          <Icon icon={User} size="md" className="text-orange-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-slate-400 font-bold text-sm block">دكتور:</span>
                            <span className="text-white font-bold">{selectedCourse.info.doc}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 pb-3 border-b border-white/5">
                          <Icon icon={Monitor} size="md" className="text-orange-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-slate-400 font-bold text-sm block">العملي:</span>
                            <span className="text-white font-bold">{selectedCourse.info.prac}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 pb-3 border-b border-white/5">
                          <Icon icon={FileText} size="md" className="text-orange-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-slate-400 font-bold text-sm block">الامتحان:</span>
                            <span className="text-white font-bold">{selectedCourse.info.exam}</span>
                          </div>
                        </div>
                      </>
                    )}
                    <Button
                      onClick={() => setSelectedCourseId(null)}
                      variant="primary"
                      className="w-full"
                    >
                      إغلاق النافذة
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .direction-ltr { direction: ltr; }
        .scrollbar-thin::-webkit-scrollbar { height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
