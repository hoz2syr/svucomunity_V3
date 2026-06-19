import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileJson, AlertCircle } from 'lucide-react';
import { TestModel, Question } from '../types';
import { saveTest } from '../lib/store';
import { v4 as uuidv4 } from 'uuid';

export default function CreateTest() {
  const [jsonText, setJsonText] = useState('');
  const [testTitle, setTestTitle] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        // Keep it strictly JSON for validation below
        setJsonText(content);
      } catch (err) {
        setError('تعذر قراءة الملف السحابي');
      }
    };
    reader.readAsText(file);
  };

  const handleCreate = () => {
    setError('');
    if (!testTitle.trim()) {
      setError('يرجى إدخال عنوان الاختبار');
      return;
    }
    
    try {
      let cleanJsonText = jsonText.trim();
      // Remove trailing/leading markdown JSON blocks if present
      cleanJsonText = cleanJsonText.replace(/^```(json)?\s*/i, '');
      cleanJsonText = cleanJsonText.replace(/\s*```$/i, '');
      
      const parsedData = JSON.parse(cleanJsonText);
      let questions: Question[] = [];
      
      // Basic heuristic to find the array of questions
      if (Array.isArray(parsedData)) {
        questions = parsedData;
      } else if (parsedData.questions && Array.isArray(parsedData.questions)) {
        questions = parsedData.questions;
      } else {
         setError('لم يتم العثور على مصفوفة أسئلة (questions) في ملف الـ JSON');
         return;
      }

      // Add IDs if missing
      questions = questions.map(q => ({
        ...q,
        id: q.id || uuidv4()
      }));

      const newTest: TestModel = {
        id: uuidv4(),
        title: testTitle,
        description: testDesc,
        createdAt: Date.now(),
        settings: {
          showExplanations: (document.getElementById('showExplanations') as HTMLInputElement)?.checked ?? true,
          globalTimeLimitMinutes: Number((document.getElementById('globalTimeLimit') as HTMLInputElement)?.value || 0)
        },
        questions
      };

      saveTest(newTest);
      navigate('/saved');
      
    } catch (err) {
      setError('صيغة JSON غير صالحة. تأكد من صحة الملف.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animation-fade-in-up">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">إنشاء اختبار جديد</h1>
        <p className="text-secondary-400">قم برفع ملف JSON أو لصقه مباشرة للبدء</p>
      </div>

      <div className="glass-card space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">عنوان الاختبار</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="مثال: اختبار أساسيات الشبكات" 
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">الوصف (اختياري)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="وصف مبسط لما يحتويه الاختبار..." 
              value={testDesc}
              onChange={(e) => setTestDesc(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">وقت الاختبار بالدقائق (0 = غير محدد)</label>
              <input 
                type="number" 
                min="0"
                className="input-field" 
                placeholder="مثال: 30"
                id="globalTimeLimit"
                defaultValue={0}
              />
            </div>
            
            <div className="flex items-center gap-3 mt-8">
               <input 
                 type="checkbox"
                 id="showExplanations"
                 className="w-5 h-5 rounded border-secondary-600 bg-secondary-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-secondary-900 focus:ring-offset-2"
                 defaultChecked
               />
               <label htmlFor="showExplanations" className="text-sm font-medium text-secondary-300 cursor-pointer">
                 إظهار التفسيرات والشروحات عند التصدير واللعب
               </label>
            </div>
          </div>
        </div>

        {/* JSON Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
             <label className="block text-sm font-medium text-secondary-300">محتوى ملف الـ JSON</label>
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition"
              >
               <UploadCloud className="w-4 h-4" />
               <span>رفع ملف...</span>
             </button>
             <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileUpload} />
          </div>
          <textarea 
            className="input-field min-h-[200px] font-mono text-xs text-left" 
            placeholder="[ { &#34;type&#34;: &#34;multiple_choice&#34;, ... } ]"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            dir="ltr"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3">
             <AlertCircle className="w-5 h-5 flex-shrink-0" />
             <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
           <button onClick={handleCreate} className="btn-primary w-full flex items-center justify-center gap-2">
              <FileJson className="w-5 h-5" />
              <span>توليد الاختبار</span>
           </button>
        </div>
      </div>
    </div>
  );
}
