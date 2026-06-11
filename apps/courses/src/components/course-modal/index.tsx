import { X, FileText, Video, Link as LinkIcon, Code, Presentation, Search, Filter, Loader2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo, useEffect } from 'react';
import { useCourseResources, type Resource } from '@/hooks/useCourseResources';
import type { Course } from '@/hooks/useCourses';

type CourseModalProps = {
  course: Course;
  onClose: () => void;
};

const resourceTypeIcons: Record<string, typeof FileText> = {
  'PDF': FileText,
  'فيديو': Video,
  'رابط': LinkIcon,
  'كود': Code,
  'شرائح': Presentation,
};

const resourceTypeColors: Record<string, string> = {
  'PDF': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'فيديو': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'رابط': 'bg-green-500/20 text-green-300 border-green-500/30',
  'كود': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'شرائح': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

function isValidUrl(value: string): boolean {
  if (/^\s*javascript\s*:/i.test(value)) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function CourseModal({ course, onClose }: CourseModalProps) {
  const { resources, loading, error } = useCourseResources(course.code);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('الكل');

  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    setSearchQuery('');
    setFilterType('الكل');
    setActiveTab('info');
  }, [course.code]);

  const filteredResources = useMemo(
    () =>
      resources.filter((resource) => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'الكل' || resource.resource_type === filterType;
        return matchesSearch && matchesFilter;
      }),
    [resources, searchQuery, filterType]
  );

  const resourceTypes = useMemo(
    () => ['الكل', ...new Set(resources.map((r) => r.resource_type))],
    [resources]
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        dir="rtl"
        className="max-w-3xl bg-slate-900/95 backdrop-blur-2xl border-white/10 text-white rounded-2xl p-0 overflow-hidden max-h-[85vh]"
        aria-label={`تفاصيل مقرر ${course.name_ar ?? course.name}`}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-b border-white/10 p-6">
          <button
            onClick={onClose}
            className="absolute top-6 start-6 text-slate-400 hover:text-white transition-colors"
            aria-label="إغلاق"
          >
            <X size={24} aria-hidden="true" />
          </button>

          <div className="ps-10">
            <div className="flex items-center gap-3 mb-3">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {course.code}
              </Badge>
              <h2 className="text-2xl text-white">{course.name_ar ?? course.name}</h2>
            </div>
            <p className="text-slate-400 text-sm">{course.major}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col" dir="rtl">
          <TabsList className="w-full bg-slate-800/30 border-b border-white/10 rounded-none px-6 pt-4 justify-start gap-2">
            <TabsTrigger
              value="info"
              aria-controls="tab-info"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-t-lg px-6 py-3"
            >
              معلومات المادة
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              aria-controls="tab-resources"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-t-lg px-6 py-3"
            >
              موارد الطلاب
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto flex-1">
            <TabsContent value="info" id="tab-info" className="p-6 m-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg text-blue-300 mb-3">وصف المادة</h3>
                  <p className="text-slate-300 leading-relaxed">
                    {course.description ?? 'لا يوجد وصف متاح لهذه المادة.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <p className="text-slate-400 text-sm mb-1">رمز المقرر</p>
                    <p className="text-white">{course.code}</p>
                  </div>
                  <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <p className="text-slate-400 text-sm mb-1">التخصص</p>
                    <p className="text-white">{course.major}</p>
                  </div>
                  <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <p className="text-slate-400 text-sm mb-1">الاسم بالإنجليزية</p>
                    <p className="text-white">{course.name}</p>
                  </div>
                  <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <p className="text-slate-400 text-sm mb-1">عدد الموارد</p>
                    <p className="text-blue-300 text-xl">
                      {loading ? '...' : resources.length}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" id="tab-resources" className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  <span className="ms-3 text-slate-400">جارٍ تحميل الموارد...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-2">حدث خطأ في تحميل الموارد</p>
                  <p className="text-slate-500 text-sm">{error}</p>
                </div>
              ) : (
                <div className="mb-4 space-y-4 px-6 pt-4">
                  {/* Filter */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Filter size={16} className="text-slate-400" aria-hidden="true" />
                    <span className="text-slate-400 text-sm">التصفية:</span>
                    {resourceTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          filterType === type
                            ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                            : 'bg-slate-800/30 text-slate-400 border border-white/10 hover:bg-slate-800/50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} aria-hidden="true" />
                    <input
                      type="text"
                      placeholder="ابحث في الموارد..."
                      aria-label="البحث في الموارد"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl ps-12 pe-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
              )}

              {!loading && !error && (
                <div className="space-y-3 px-6 pb-6">
                  {filteredResources.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      {resources.length === 0
                        ? 'لا توجد موارد مضافة لهذه المادة بعد'
                        : 'لا توجد موارد متطابقة مع البحث'}
                    </div>
                  ) : (
                    filteredResources.map((resource) => (
                      <ResourceItem key={resource.id} resource={resource} />
                    ))
                  )}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ResourceItem({ resource }: { resource: Resource }) {
  const Icon = resourceTypeIcons[resource.resource_type] ?? FileText;
  const colorClass = resourceTypeColors[resource.resource_type] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  const urlValid = isValidUrl(resource.url);

  return (
    <div
      className={`group block bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 transition-all ${
        urlValid ? 'hover:bg-slate-800/50 hover:border-blue-500/30' : 'opacity-75'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon size={24} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-white mb-2 group-hover:text-blue-300 transition-colors">
            {resource.title}
          </h4>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <Badge className={`${colorClass} text-xs`}>
              {resource.resource_type}
            </Badge>
            {resource.description && (
              <span className="truncate">{resource.description}</span>
            )}
            <span>•</span>
            <span>{resource.uploader_name}</span>
          </div>
          {!urlValid && (
            <div className="flex items-center gap-1.5 mt-2 text-amber-400 text-xs">
              <AlertTriangle size={14} aria-hidden="true" />
              <span>رابط غير صالح — OS: هذا المورد غير متاح حالياً</span>
            </div>
          )}
        </div>

        {urlValid && (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-blue-500/20 text-blue-300 opacity-0 group-hover:opacity-100 transition-all"
            aria-label={`فتح ${resource.title} في تبويب جديد`}
          >
            <LinkIcon size={20} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}
