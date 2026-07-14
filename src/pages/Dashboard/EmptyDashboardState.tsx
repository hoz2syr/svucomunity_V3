import { motion } from 'motion/react';
import { StudyGroupsCard } from '../../components/dashboard/StudyGroupsCard';
import { CourseMaterialsCard } from '../../components/dashboard/CourseMaterialsCard';
import { ScheduleExtractionCard } from '../../components/dashboard/ScheduleExtractionCard';
import { TestsCard } from '../../components/dashboard/TestsCard';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type EmptyDashboardStateProps = { userName?: string };

const TODAY = new Date().toLocaleDateString('ar-SA', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export const EmptyDashboardState = ({ userName = 'طالب' }: EmptyDashboardStateProps) => {
  const reducedMotion = useReducedMotion();

  const cards = [
    { Component: StudyGroupsCard, label: 'المجموعات الدراسية' },
    { Component: CourseMaterialsCard, label: 'المواد الدراسية' },
    { Component: ScheduleExtractionCard, label: 'استخراج الجدول' },
    { Component: TestsCard, label: 'الاختبارات' },
  ] as const;

  return (
    <div className="flex-1 p-6 lg:p-12 relative z-10 w-full h-full mt-20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-sm">
              {userName.charAt(0)}
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{TODAY}</p>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3">
            مرحبا بك، {userName}
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
            اختر أداة من الأسفل للبدء. كل ميزة تساعدك على تنظيم دراستك والوصول إلى موادك بسرعة.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {cards.map(({ Component, label }, index) => (
            <motion.div
              key={label}
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 0.45, delay: 0.1 * index, ease: 'easeOut' }
              }
            >
              <Component />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

