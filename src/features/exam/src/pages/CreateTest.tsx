"use client";

import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileJson, AlertCircle } from 'lucide-react';
import { useTestCreator } from '../hooks';
import { Button } from '@/src/components/ui/Button';
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
               <input type="checkbox" id="showExplanations" checked={showExplanations} onChange={(e) => setShowExplanations(e.target.checked)} className="w-5 h-5 rounded border-secondary-600 bg-[var(--color-bg-elevated)] text-primary-500 focus:ring-primary-500 focus:ring-offset-secondary-900 focus:ring-offset-2" />
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
          <textarea className="input-field min-h-[200px] font-mono text-xs text-left" placeholder={`[ {\n  "type": "multiple_choice",\n  "text": "What is $x + y$?",\n  "options": ["2", "3", "4", "5"],\n  "correctAnswer": "3"\n} ]\n\nMarkdown + LaTeX supported:\n$E = mc^2$, $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$`} value={jsonText} onChange={(e) => setJsonText(e.target.value)} dir="ltr" />
          <details className="mt-3">
            <summary className="text-xs text-secondary-400 cursor-pointer hover:text-white transition select-none">مثال JSON كامل مع معادلات ومخطط</summary>
            <pre className="mt-2 p-4 rounded-xl bg-slate-950/80 border border-white/10 text-[11px] text-secondary-300 overflow-x-auto whitespace-pre-wrap">{`{
  "title": "اختبار التفاضل",
  "description": "يشمل مشتقات ولوغاريتمات",
  "questions": [
    {
      "type": "multiple_choice",
      "text": "أوجد مشتق الدالة $$f(x) = x^2 + 3x$$",
      "options": [
        "$2x + 3$",
        "$x + 3$",
        "$2x^2 + 3$",
        "$x^2 + 3$"
      ],
      "correctAnswer": "$2x + 3$",
      "explanation": "باستخدام قاعدة القوة: $\\frac{d}{dx}(x^n) = nx^{n-1}$"
    },
    {
      "type": "true_false",
      "text": "المعادلة $\\log(a \\cdot b) = \\log a + \\log b$ صحيحة",
      "correctAnswer": "true"
    },
    {
      "type": "essay",
      "text": "اشرح مفهوم النهاية للمتتالية: $$\\lim_{x \\to 0} \\frac{\\sin x}{x}$$"
    }
  ],
  "settings": {
    "showExplanations": true,
    "globalTimeLimitMinutes": 15
  }
}`}</pre>
          </details>
        </div>

        {error && (
          <div className="bg-[var(--color-danger-light)] border border-[var(--color-danger-border)] text-[var(--color-danger-400)] px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <Button onClick={() => handleCreate(navigate)} variant="primary" className="w-full flex items-center justify-center gap-2" icon={<FileJson className="w-5 h-5" />}>
          <span>توليد الاختبار</span>
        </Button>
        </div>
      </div>
    </div>
  );
}
