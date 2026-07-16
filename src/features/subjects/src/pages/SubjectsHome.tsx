import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Search, BookOpen, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSubjects } from '../hooks/useSubjects';
import { useCurrentSemesterCourses } from "../../../schedule-extraction/hooks/useCurrentSemesterCourses";
import { SubjectCard } from '../../components/SubjectCard';

export function SubjectsHome() {
  const { subjects, major } = useSubjects();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: currentSemesterCourses = [] } = useCurrentSemesterCourses();

  const currentSemesterCourseCodes = useMemo(() => {
    return new Set(currentSemesterCourses.map(course => course.full_code));
  }, [currentSemesterCourses]);

  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;
    const query = searchQuery.trim().toLowerCase();
    return subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(query) ||
        subject.id.toLowerCase().includes(query)
    );
  }, [subjects, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">المصادر</h1>
        <p className="text-slate-400 text-sm">جميع المواد الدراسية ومصادرها</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/dashboard/courses">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="group relative flex flex-col rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-white/8 border-t-amber-500 overflow-hidden transition-all duration-200 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-400/70 h-full hover:bg-[rgba(245,158,11,0.06)]"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/[0.03] to-transparent" />
            <div className="relative z-10 flex flex-col gap-5 h-full p-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                <Monitor className="w-8 h-8" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-extrabold text-white leading-snug tracking-wide">
                  المحاكي
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  صمم خطتك الدراسية وتابع تقدمك
                </p>
              </div>
              <div className="mt-auto pt-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-sm font-bold transition-all duration-200 text-amber-400 group-hover:text-amber-300 group-hover:border-white/20 group-hover:bg-white/5">
                  افتح المحاكي
                </div>
              </div>
            </div>
          </motion.div>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="group relative flex flex-col rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-white/8 border-t-cyan-500 overflow-hidden transition-all duration-200 hover:-translate-y-1 h-full hover:bg-[rgba(6,182,212,0.06)]"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/[0.03] to-transparent" />
          <div className="relative z-10 flex flex-col gap-5 h-full p-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-105">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-extrabold text-white leading-snug tracking-wide">
                المصادر الدراسية
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                تصفّح جميع المواد ومصادرها من اختبارات ومجموعات ومراجع
              </p>
            </div>
            <div className="mt-auto pt-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-sm font-bold transition-all duration-200 text-cyan-400 group-hover:text-cyan-300 group-hover:border-white/20 group-hover:bg-white/5">
                تصفّح المصادر
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <GlassCard>
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="البحث عن مادة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>
          {major && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <BookOpen className="w-4 h-4" />
              <span>التخصص: {major}</span>
            </div>
          )}
        </div>
      </GlassCard>

      {filteredSubjects.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p>لا توجد مواد تطابق بحثك.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              course={subject}
              isCurrentSemester={currentSemesterCourseCodes.has(subject.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
