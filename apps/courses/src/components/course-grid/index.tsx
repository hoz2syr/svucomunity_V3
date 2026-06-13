import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown, Search, ArrowUpDown } from 'lucide-react';
import type { SupabaseCourse as Course } from '@/hooks/useCourses';
import { useState, useMemo } from 'react';

type CourseGridProps = {
  courses: Course[];
  onCourseClick: (course: Course) => void;
};

type SortKey = 'name_ar' | 'code' | 'credits' | 'semester';

export function CourseGrid({ courses, onCourseClick }: CourseGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name_ar');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedCourses = useMemo(() => {
    let result = [...courses];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (course) =>
          (course.name_ar ?? course.name).toLowerCase().includes(query) ||
          (course.name ?? '').toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      switch (sortKey) {
        case 'name_ar':
          valA = a.name_ar ?? a.name ?? '';
          valB = b.name_ar ?? b.name ?? '';
          break;
        case 'code':
          valA = a.code ?? '';
          valB = b.code ?? '';
          break;
        case 'credits':
          valA = a.credits ?? 0;
          valB = b.credits ?? 0;
          break;
        case 'semester':
          valA = a.semester ?? 0;
          valB = b.semester ?? 0;
          break;
        default:
          valA = a.name_ar ?? a.name ?? '';
          valB = b.name_ar ?? b.name ?? '';
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).localeCompare(String(valB), 'ar');
      if (sortDirection === 'desc') {
        return -strA;
      }
      return strA;
    });

    return result;
  }, [courses, searchQuery, sortKey, sortDirection]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="البحث عن مقرر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-slate-800/50 backdrop-blur-xl border-white/10 text-white rounded-xl h-12 hover:bg-slate-800/70 transition-all"
          />
        </div>

        <Select
          value={sortKey}
          onValueChange={(val) => setSortKey(val as SortKey)}
        >
          <SelectTrigger className="w-[220px] bg-slate-800/50 backdrop-blur-xl border-white/10 text-white rounded-xl h-12 px-4 hover:bg-slate-800/70 transition-all">
            <ArrowUpDown className="ml-2 h-4 w-4 text-slate-400" />
            <SelectValue placeholder="ترتيب حسب" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 backdrop-blur-xl border-white/10 text-white rounded-xl">
            <SelectItem value="name_ar" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">
              الاسم
            </SelectItem>
            <SelectItem value="code" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">
              الرمز
            </SelectItem>
            <SelectItem value="credits" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">
              الساعات
            </SelectItem>
            <SelectItem value="semester" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">
              الفصل
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          className="bg-slate-800/50 backdrop-blur-xl border-white/10 text-white rounded-xl h-12 w-12 hover:bg-slate-800/70 transition-all"
          aria-label={sortDirection === 'asc' ? 'ترتيب تصاعدي' : 'ترتيب تنازلي'}
        >
          {sortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4 text-blue-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-blue-400" />
          )}
        </Button>
      </div>

      {filteredAndSortedCourses.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-lg">
          لا توجد نتائج مطابقة للبحث
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCourses.map((course) => (
            <button
              key={course.id}
              onClick={() => onCourseClick(course)}
              aria-label={`تفاصيل مقرر ${course.name_ar ?? course.name}`}
              className="
                group relative overflow-hidden rounded-2xl
                bg-slate-800/30 backdrop-blur-xl
                border border-white/10 p-6 text-start
                hover:border-blue-500/50 hover:bg-slate-800/50
                active:scale-[0.98]
                transition-all duration-300
                hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
              "
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <div className="mb-4">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 text-sm px-3 py-1">
                    {course.code}
                  </Badge>
                </div>

                <h3 className="text-xl text-white mb-3 group-hover:text-blue-300 transition-colors">
                  {course.name_ar ?? course.name}
                </h3>

                <div className="mb-4">
                  <Badge
                    variant="outline"
                    className="bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20"
                  >
                    {course.major}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">الاسم:</span>
                    <span>{course.name}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
