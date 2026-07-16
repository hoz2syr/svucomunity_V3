'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Icon } from '@/src/components/ui/Icon';
import type { Json } from '@/src/types/database';
import { useAdminExtractions, useAdminExtractionDetail } from '../../features/admin/hooks/useAdminExtractions';
import type { AdminExtraction } from '../../features/admin/services/adminExtractionService.supabase';
import {
  Search,
  FileText,
  User,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Eye,
  BookOpen,
  ChevronLeft,
  Shield,
} from 'lucide-react';

type DetailModalData = {
  extraction: {
    id: string;
    created_at: string;
    detected_schema: Json;
    user_id: string;
    raw_markdown: string;
  };
  courses: Array<{
    id: string;
    course_name: string;
    semester_code: string;
    full_code: string;
    instructor_name: string | null;
    major: string;
  }>;
  user?: {
    id: string;
    full_name: string | null;
    email: string | null;
    username: string | null;
    role: string | null;
  };
};

export function ExtractionTracking() {
  const { profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExtraction, setSelectedExtraction] = useState<DetailModalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: extractions, isLoading: extractionsLoading, error: extractionsError, refetch } = useAdminExtractions();
  const { data: detail, isLoading: detailLoading } = useAdminExtractionDetail(
    isModalOpen && selectedExtraction ? selectedExtraction.extraction.id : null
  );

  const filteredExtractions = useMemo(() => {
    if (!extractions) return [];
    return extractions.filter((extraction: AdminExtraction) => {
      const matchesSearch =
        extraction.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        extraction.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        extraction.raw_markdown.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [extractions, searchQuery]);

  const openDetail = (extraction: DetailModalData['extraction']) => {
    setSelectedExtraction({
      extraction,
      courses: [],
      user: undefined,
    });
    setIsModalOpen(true);
  };

  const closeDetail = () => {
    setIsModalOpen(false);
    setSelectedExtraction(null);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-cyan-400 text-lg">جاري التحميل...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <GlassCard className="p-8 text-center max-w-md">
          <Icon icon={Shield} size="xl" className="text-rose-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">غير مصرح</h2>
          <p className="text-slate-400 text-sm">ليس لديك صلاحية الوصول لهذه الصفحة</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 pt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">تتبع الاستخراجات</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          عرض جميع عمليات استخراج الجداول الدراسية
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon icon={Search} size="sm" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث بالمستخدم أو محتوى الاستخراج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => refetch()}
          icon={<Icon icon={RefreshCw} size="xs" />}
        >
          تحديث
        </Button>
      </div>

      {extractionsError && (
        <GlassCard className="p-4 border-rose-500/30">
          <div className="flex items-center gap-2 text-rose-400">
            <Icon icon={AlertTriangle} size="sm" />
            <span className="text-sm">{extractionsError instanceof Error ? extractionsError.message : 'حدث خطأ'}</span>
          </div>
        </GlassCard>
      )}

      {extractionsLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <GlassCard key={i} className="p-5">
              <Skeleton className="w-full h-16" />
            </GlassCard>
          ))}
        </div>
      ) : filteredExtractions.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Icon icon={CheckCircle2} size="xl" className="text-emerald-400 mb-3" />
          <p className="text-slate-400 text-sm">لا توجد استخراجات</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
            {filteredExtractions.map((extraction: AdminExtraction) => (
            <GlassCard key={extraction.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon={FileText} size="sm" className="text-cyan-400 shrink-0" />
                    <h3 className="text-white font-medium truncate">
                      استخراج #{extraction.id.slice(0, 8)}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {extraction.course_count} مادة
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    {extraction.user && (
                      <span className="flex items-center gap-1">
                        <Icon icon={User} size="xs" />
                        {extraction.user.full_name || extraction.user.email || 'مستخدم'}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Icon icon={Calendar} size="xs" />
                      {new Date(extraction.created_at).toLocaleString('ar-SA')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    onClick={() => openDetail(extraction)}
                    icon={<Icon icon={Eye} size="xs" />}
                  >
                    عرض
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {isModalOpen && selectedExtraction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-4xl max-h-[80vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">تفاصيل الاستخراج</h2>
              <Button variant="ghost" onClick={closeDetail}>
                <Icon icon={ChevronLeft} size="sm" />
              </Button>
            </div>

            {detailLoading ? (
              <div className="space-y-4">
                <Skeleton className="w-full h-20" />
                <Skeleton className="w-full h-20" />
                <Skeleton className="w-full h-20" />
              </div>
            ) : detail ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">المستخدم</p>
                    <p className="text-sm text-white font-medium">
                      {detail.user?.full_name || detail.user?.email || 'غير معروف'}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">التاريخ</p>
                    <p className="text-sm text-white font-medium">
                      {new Date(detail.extraction.created_at).toLocaleString('ar-SA')}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">عدد المواد</p>
                    <p className="text-sm text-white font-medium">{detail.courses.length}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">المخطط</p>
                    <p className="text-sm text-white font-medium">
                      {Object.keys(detail.extraction.detected_schema || {}).length > 0
                        ? 'تم الكشف'
                        : 'غير محدد'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Icon icon={BookOpen} size="sm" className="text-cyan-400" />
                    المواد المستخرجة
                  </h3>
                  <div className="grid gap-3">
                    {detail.courses.map((course: { id: string; course_name: string; semester_code: string; full_code: string; instructor_name: string | null; major: string; }) => (
                      <div
                        key={course.id}
                        className="p-4 bg-white/5 rounded-xl border border-white/5"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{course.course_name}</p>
                            <p className="text-xs text-slate-400 font-mono mt-1">
                              {course.full_code}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-white/5 rounded-lg text-slate-300">
                              {course.major}
                            </span>
                            <span className="text-xs px-2 py-1 bg-cyan-500/10 rounded-lg text-cyan-400">
                              {course.semester_code}
                            </span>
                          </div>
                        </div>
                        {course.instructor_name && (
                          <p className="text-xs text-slate-400 mt-2">
                            المحاضر: {course.instructor_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4">البيانات الخام</h3>
                  <pre className="p-4 bg-black/30 rounded-xl text-xs text-slate-300 overflow-auto max-h-64 whitespace-pre-wrap">
                    {detail.extraction.raw_markdown}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">حدث خطأ في تحميل التفاصيل</p>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
