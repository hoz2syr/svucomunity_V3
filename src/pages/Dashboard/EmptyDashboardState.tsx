import { motion } from 'motion/react';
import { StudyGroupsCard } from '../../components/dashboard/StudyGroupsCard';
import { CourseMaterialsCard } from '../../components/dashboard/CourseMaterialsCard';
import { ScheduleExtractionCard } from '../../components/dashboard/ScheduleExtractionCard';
import { TestsCard } from '../../components/dashboard/TestsCard';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type EmptyDashboardStateProps = { userName?: string };

export const EmptyDashboardState = ({ userName = 'طالب' }: EmptyDashboardStateProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex-1 p-6 lg:p-12 relative z-10 w-full h-full mt-20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.5 }}
          className="mb-10"
        >
        <h1 className="text-4xl font-black text-white tracking-tight mb-3">
          مرحبا بك، {userName}
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
          اختر أداة من الأسفل للبدء. كل ميزة تساعدك على تنظيم دراستك والوصول إلى موادك بسرعة.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StudyGroupsCard />
        <CourseMaterialsCard />
        <ScheduleExtractionCard />
        <TestsCard />
      </div>
    </div>
  </div>
  );
};

