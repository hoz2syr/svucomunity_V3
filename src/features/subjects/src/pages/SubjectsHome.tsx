import { useMemo, useState } from 'react';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Search, BookOpen } from 'lucide-react';
import { useSubjects } from '../hooks/useSubjects';
import { SubjectCard } from '../../components/SubjectCard';

export function SubjectsHome() {
  const { subjects, major } = useSubjects();
  const [searchQuery, setSearchQuery] = useState('');

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
            <SubjectCard key={subject.id} course={subject} />
          ))}
        </div>
      )}
    </div>
  );
}
