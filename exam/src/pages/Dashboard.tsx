import { useState, useEffect } from 'react';
import { getTests } from '../lib/store';
import { BarChart3, BookOpen, FileQuestion, Calendar } from 'lucide-react';
import { LoadingScreen } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTests: 0,
    totalQuestions: 0,
    recentTests: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO(Integration): Replace local store calls with backend fetch
      await new Promise(resolve => setTimeout(resolve, 700));
      const tests = getTests();
      
      // Calculate basics
      const tCount = tests.length;
      const qCount = tests.reduce((acc, test) => acc + (test.questions?.length || 0), 0);
      
      // Tests in last 7 days
      const now = Date.now();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const recent = tests.filter(t => (now - t.createdAt) < sevenDaysMs).length;
      
      setStats({
        totalTests: tCount,
        totalQuestions: qCount,
        recentTests: recent
      });
    } catch (err) {
      setError('حدث خطأ أثناء تحميل بيانات لوحة التحكم.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (error) return <ErrorState title="خطأ في جلب الإحصائيات" message={error} onRetry={fetchStats} />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animation-fade-in-up">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">لوحة الإحصائيات</h1>
        <p className="text-secondary-400">نظرة عامة على نشاطاتك والاختبارات المنشأة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <div className="glass-card stat-card flex items-center gap-4 animate-pulse bg-secondary-800/40">
               <div className="bg-secondary-700/50 w-14 h-14 rounded-2xl"></div>
               <div className="space-y-2">
                 <div className="h-4 w-24 bg-secondary-700/50 rounded-md"></div>
                 <div className="h-8 w-12 bg-secondary-700/50 rounded-md"></div>
               </div>
            </div>
            <div className="glass-card stat-card flex items-center gap-4 animate-pulse bg-secondary-800/40">
               <div className="bg-secondary-700/50 w-14 h-14 rounded-2xl"></div>
               <div className="space-y-2">
                 <div className="h-4 w-24 bg-secondary-700/50 rounded-md"></div>
                 <div className="h-8 w-12 bg-secondary-700/50 rounded-md"></div>
               </div>
            </div>
            <div className="glass-card stat-card flex items-center gap-4 animate-pulse bg-secondary-800/40">
               <div className="bg-secondary-700/50 w-14 h-14 rounded-2xl"></div>
               <div className="space-y-2">
                 <div className="h-4 w-24 bg-secondary-700/50 rounded-md"></div>
                 <div className="h-8 w-12 bg-secondary-700/50 rounded-md"></div>
               </div>
            </div>
          </>
        ) : (
          <>
            <div className="glass-card stat-card flex items-center gap-4">
               <div className="bg-gradient-to-br from-primary-400 to-primary-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
                 <BookOpen className="w-7 h-7 text-white" />
               </div>
               <div>
                 <p className="text-secondary-400 text-sm font-medium">إجمالي الاختبارات</p>
                 <h4 className="text-3xl font-bold text-white">{stats.totalTests}</h4>
               </div>
            </div>
    
            <div className="glass-card stat-card flex items-center gap-4">
               <div className="bg-gradient-to-br from-accent-400 to-accent-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
                 <FileQuestion className="w-7 h-7 text-white" />
               </div>
               <div>
                 <p className="text-secondary-400 text-sm font-medium">إجمالي الأسئلة</p>
                 <h4 className="text-3xl font-bold text-white">{stats.totalQuestions}</h4>
               </div>
            </div>
    
            <div className="glass-card stat-card flex items-center gap-4">
               <div className="bg-gradient-to-br from-green-400 to-green-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
                 <Calendar className="w-7 h-7 text-white" />
               </div>
               <div>
                 <p className="text-secondary-400 text-sm font-medium">آخر 7 أيام</p>
                 <h4 className="text-3xl font-bold text-white">{stats.recentTests}</h4>
               </div>
            </div>
          </>
        )}
      </div>
      
      {/* Visual Chart Placeholder Area */}
      <div className="glass-card mt-8 p-8 h-64 flex flex-col items-center justify-center">
         <BarChart3 className="w-16 h-16 text-secondary-600 mb-4" />
         <p className="text-secondary-400 text-center max-w-sm">
            بمجرد إنشاء المزيد من الاختبارات، سيتم عرض رسم بياني تحليلي لنشاطك هنا.
         </p>
      </div>
    </div>
  );
}
