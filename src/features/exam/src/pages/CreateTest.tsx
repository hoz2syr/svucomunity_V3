"use client";

import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileJson, AlertCircle } from 'lucide-react';
import { useTestCreator } from '../hooks';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { PublishedTestsFilters } from '@/src/features/exam/components/PublishedTestsFilters';

export default function CreateTest() {
  const navigate = useNavigate();
  const { jsonText, setJsonText, testTitle, setTestTitle, testDesc, setTestDesc, error, showExplanations, setShowExplanations, globalTimeLimit, setGlobalTimeLimit, selectedMajor, setSelectedMajor, selectedCourse, setSelectedCourse, majors, courses, fileInputRef, handleFileUpload, handleCreate } = useTestCreator();

  const clearFilters = () => {
    setSelectedMajor('');
    setSelectedCourse('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animation-fade-in-up mt-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">إنشاء اختبار جديد</h1>
        <p className="text-secondary-400">قم برفع ملف JSON أو لصقه مباشرة للبدء</p>
      </div>

      <div className="glass-card space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">عنوان الاختبار</label>
            <input type="text" className="input-field" placeholder="مثال: اختبار أساسيات الشبكات" value={testTitle} onChange={(e) => setTestTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">الوصف (اختياري)</label>
            <input type="text" className="input-field" placeholder="وصف مبسط لما يحتويه الاختبار..." value={testDesc} onChange={(e) => setTestDesc(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">وقت الاختبار بالدقائق (0 = غير محدد)</label>
              <input type="number" min="0" className="input-field" placeholder="مثال: 30" value={globalTimeLimit} onChange={(e) => setGlobalTimeLimit(Number(e.target.value))} />
            </div>

            <div className="flex items-center gap-3 mt-8">
              <input type="checkbox" id="showExplanations" checked={showExplanations} onChange={(e) => setShowExplanations(e.target.checked)} className="w-5 h-5 rounded border-secondary-600 bg-secondary-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-secondary-900 focus:ring-offset-2" />
              <label htmlFor="showExplanations" className="text-sm font-medium text-secondary-300 cursor-pointer">
                إظهار التفسيرات والشروحات عند التصدير واللعب
              </label>
            </div>
          </div>

          <PublishedTestsFilters
            majors={majors}
            courses={courses}
            selectedMajor={selectedMajor}
            selectedCourse={selectedCourse}
            searchQuery=""
            searchInput=""
            onMajorChange={(v: string) => { setSelectedMajor(v); setSelectedCourse(''); }}
            onCourseChange={(v: string) => setSelectedCourse(v)}
            onSearchInputChange={() => {}}
            onSearchTrigger={() => {}}
            onClearFilters={clearFilters}
            showSearch={false}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-secondary-300">محتوى ملف الـ JSON</label>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition">
              <UploadCloud className="w-4 h-4" />
              <span>رفع ملف...</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileUpload} />
          </div>
          <textarea className="input-field min-h-[200px] font-mono text-xs text-left" placeholder="[ { &#34;type&#34;: &#34;multiple_choice&#34;, ... } ]" value={jsonText} onChange={(e) => setJsonText(e.target.value)} dir="ltr" />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <PrimaryButton onClick={() => handleCreate(navigate)} className="w-full flex items-center justify-center gap-2" icon={<FileJson className="w-5 h-5" />}>
          <span>توليد الاختبار</span>
        </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
