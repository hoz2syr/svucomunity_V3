import { useCoursesApp } from './hooks/useCoursesApp';
import { CourseGrid } from './components/course-grid';
import { MajorSelector } from './components/major-selector';
import { CourseModal } from './components/course-modal';
import { ErrorBoundary } from './components/ErrorBoundary';
import SkeletonGrid from './components/course-grid/SkeletonGrid';
import InteractiveMap from './components/interactive-map/InteractiveMap';
import { Header, FilterBar } from './components/layout';
import { GitBranch, BookOpen } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';

const ALL_MAJORS = 'جميع التخصصات';

export { type SupabaseCourse } from './hooks/useCourses';

export default function App() {
  const {
    state,
    actions,
    filteredCourses,
    majors,
    loading,
    error,
    courseStats,
  } = useCoursesApp();

  const { activeTab, selectedMajor, selectedCourse } = state;
  const { setActiveTab, setSelectedMajor, setSelectedCourse, refetchCourses } = actions;

  const getTabTriggerClass = (tabValue: string) =>
    `flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
      activeTab === tabValue
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir="rtl" lang="ar">
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <Header />

          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="max-w-7xl mx-auto">
            <Tabs.List aria-describedby="tabs-desc" className="flex gap-1 px-6 pt-6">
              <span id="tabs-desc" className="sr-only">
                تنقل بين المقررات الدراسية والمخطط التفاعلي
              </span>
              <Tabs.Trigger value="courses" className={getTabTriggerClass('courses')}>
                <BookOpen className="w-4 h-4" />
                المقررات الدراسية
              </Tabs.Trigger>
              <Tabs.Trigger value="map" className={getTabTriggerClass('map')}>
                <GitBranch className="w-4 h-4" />
                المخطط التفاعلي
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="courses">
              <FilterBar
                majors={[ALL_MAJORS, ...majors]}
                selectedMajor={selectedMajor}
                onSelectMajor={setSelectedMajor}
                loading={loading}
                courseStats={courseStats}
                onRetry={refetchCourses}
              />

              <div className="px-6 pb-12">
                {loading ? (
                  <SkeletonGrid count={6} />
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-400 text-lg mb-2">حدث خطأ في تحميل المواد</p>
                    <p className="text-slate-500 text-sm mb-4">{error}</p>
                    <button
                      onClick={refetchCourses}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                ) : (
                  <CourseGrid courses={filteredCourses} onCourseClick={setSelectedCourse} />
                )}
              </div>
            </Tabs.Content>

            <Tabs.Content value="map" className="h-[calc(100vh-180px)]">
              <InteractiveMap />
            </Tabs.Content>
          </Tabs.Root>
        </div>

        {selectedCourse && (
          <CourseModal
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
