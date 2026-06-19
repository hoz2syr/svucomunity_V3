import { useState, useEffect } from 'react';
import { getTests, deleteTest } from '../lib/store';
import { TestModel } from '../types';
import { FileText, Trash2, Printer, Download, Clock, Play } from 'lucide-react';
import { exportToPdf, exportToWord } from '../lib/export';
import { Link } from 'react-router-dom';
import { LoadingScreen } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';
import { TestCardSkeleton } from '../components/Skeletons';

export default function SavedTests() {
  const [tests, setTests] = useState<TestModel[]>([]);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO(Integration): ستقوم بتبديل هذا بالاعتماد على قاعدة البيانات الفعلية بواسطة fetch API
      await new Promise(resolve => setTimeout(resolve, 800)); // محاكاة لزمن التأخير في الشبكة
      setTests(getTests());
    } catch (err) {
      setError('تعذر جلب الاختبارات المحفوظة. يرجى التأكد من اتصالك بالإنترنت والمحاولة مجدداً.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الاختبار؟')) {
      deleteTest(id);
      await fetchTests();
    }
  };

  const handlePrintPdf = async (test: TestModel) => {
     setLoadingPdf(test.id);
     try {
       await exportToPdf(test);
     } catch (e) {
       console.error("Failed to export PDF", e);
       alert('حدث خطأ أثناء تصدير ملف PDF');
     }
     setLoadingPdf(null);
  };

  const handleExportWord = async (test: TestModel) => {
      try {
        await exportToWord(test);
      } catch (e) {
        console.error("Failed to export Word", e);
        alert('حدث خطأ أثناء تصدير ملف Word');
      }
  };

  if (error) return <ErrorState title="خطأ في تحميل البيانات" message={error} onRetry={fetchTests} />;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animation-fade-in-up">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">اختباراتي المحفوظة</h1>
        <p className="text-secondary-400">راجع واطبع وشارك اختباراتك السابقة</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TestCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
           <div className="w-20 h-20 rounded-full bg-secondary-800 flex items-center justify-center mb-4">
             <FileText className="w-10 h-10 text-secondary-500" />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">لا يوجد اختبارات بعد</h3>
           <p className="text-secondary-400 mb-6">قم بإنشاء اختبارك الأول من ملف JSON الآن</p>
           <Link to="/create" className="btn-primary flex items-center gap-2">إنشاء اختبار</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map(test => (
            <div key={test.id} className="glass-card flex flex-col h-full card-hover">
              <div className="flex-1">
                 <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{test.title}</h3>
                 {test.description && (
                   <p className="text-secondary-400 text-sm mb-4 line-clamp-2">{test.description}</p>
                 )}
                 <div className="flex items-center gap-4 text-xs font-medium text-secondary-400 mt-auto">
                    <span className="flex items-center gap-1.5 bg-secondary-800 px-2 py-1 rounded-md">
                       <FileText className="w-3.5 h-3.5" />
                       {test.questions.length} أسئلة
                    </span>
                    <span className="flex items-center gap-1.5 bg-secondary-800 px-2 py-1 rounded-md">
                       <Clock className="w-3.5 h-3.5" />
                       {new Date(test.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                 </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-white/10">
                 <Link to={`/play/${test.id}`} className="btn-accent w-full py-2 text-sm flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    <span>خوض الاختبار المدعوم (للطالب)</span>
                 </Link>
                 <div className="flex items-center gap-2">
                   <button 
                    onClick={() => handlePrintPdf(test)} 
                    disabled={loadingPdf === test.id}
                    className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      <Printer className="w-4 h-4" />
                      <span>{loadingPdf === test.id ? 'يُحضر..' : 'PDF'}</span>
                   </button>
                   <button onClick={() => handleExportWord(test)} className="btn-glass p-2 flex-1 flex items-center justify-center gap-2 text-sm" title="تصدير Word">
                      <Download className="w-4 h-4" />
                      <span>Word</span>
                   </button>
                   <button onClick={() => handleDelete(test.id)} className="btn-danger p-2" title="حذف الاختبار">
                      <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
