import { useState, useEffect } from 'react';
import { Sparkles, Box, Settings, Copy, CheckCircle2, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [topic, setTopic] = useState('الشبكات');
  const [difficulty, setDifficulty] = useState('متوسط');
  const [mcqCount, setMcqCount] = useState(10);
  const [tfCount, setTfCount] = useState(5);
  const [essayCount, setEssayCount] = useState(0);
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('svu_prompt_settings');
    if (saved) {
      try {
         const parsed = JSON.parse(saved);
         if (parsed.topic) setTopic(parsed.topic);
         if (parsed.difficulty) setDifficulty(parsed.difficulty);
         if (parsed.mcqCount !== undefined) setMcqCount(parsed.mcqCount);
         if (parsed.tfCount !== undefined) setTfCount(parsed.tfCount);
         if (parsed.essayCount !== undefined) setEssayCount(parsed.essayCount);
         if (parsed.includeExplanations !== undefined) setIncludeExplanations(parsed.includeExplanations);
      } catch (e) {}
    }
  }, []);

  const savePreferences = () => {
     localStorage.setItem('svu_prompt_settings', JSON.stringify({
        topic, difficulty, mcqCount, tfCount, essayCount, includeExplanations
     }));
     setIsSaved(true);
     setTimeout(() => setIsSaved(false), 2000);
  };

  const generatePrompt = () => {
    let prompt = `أريد منك إنشاء اختبار حول موضوع "${topic || 'عام'}".\n`;
    prompt += `مستوى الصعوبة: ${difficulty}.\n\n`;
    prompt += `يتكون الاختبار من:\n`;
    if (mcqCount > 0) prompt += `- ${mcqCount} أسئلة اختيار من متعدد.\n`;
    if (tfCount > 0) prompt += `- ${tfCount} أسئلة صح/خطأ.\n`;
    if (essayCount > 0) prompt += `- ${essayCount} أسئلة مقالية.\n`;
    
    prompt += `\nيجب أن تقوم بإرجاع النتيجة حصرياً بصيغة JSON صالحة بالشكل التالي تماماً:\n`;
    prompt += `[\n  {\n`;
    prompt += `    "id": "معرف_فريد_مثلا_uuid",\n`;
    prompt += `    "type": "multiple_choice" أو "true_false" أو "essay",\n`;
    prompt += `    "text": "نص السؤال الدقيق",\n`;
    prompt += `    "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"], // فقط لأسئلة multiple_choice\n`;
    prompt += `    "correctAnswer": "الإجابة الصحيحة نصاً (يجب أن تطابق أحد الخيارات لأسئلة multiple_choice، أو 'true' أو 'false' لأسئلة true_false)",\n`;
    
    if (includeExplanations) {
      prompt += `    "explanation": "شرح مفصل ومفيد لسبب الإجابة الصحيحة، وتصحيح للمفاهيم الخاطئة المحتملة"\n`;
    }
    
    prompt += `  }\n]\n`;
    prompt += `\nتأكد من عدم إضافة أية نصوص إضافية خارج مصفوفة الـ JSON، فقط قم بإرجاع الـ JSON الخام الصالح.`;
    
    return prompt;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePrompt());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-12 animation-fade-in-up">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6 mt-8">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
          حول ملفات JSON المعقدة إلى
          <br />
          <span className="gradient-text">اختبارات احترافية</span> فوراً
        </h1>
        <p className="text-secondary-400 text-lg leading-relaxed">
          منصة متكاملة لبناء الاختبارات من متعدد والصح والخطأ، مع خيارات تصدير מתقدمة كـ PDF منظم للطباعة والتخصيص الكامل للأسئلة والإجابات والشروحات.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/create" className="btn-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>توليد اختبار جديد</span>
          </Link>
          <Link to="/saved" className="btn-glass flex items-center gap-2">
            <Box className="w-5 h-5" />
            <span>عرض الاختبارات السابقة</span>
          </Link>
        </div>
      </div>

      {/* Instructions / Prompt builder card */}
      <div className="glass-card max-w-4xl mx-auto w-full mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-500/20 text-amber-500 p-2 rounded-lg">
            <Settings className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">كيفية إنشاء ملف JSON المطلوب؟</h2>
        </div>
        
        <div className="space-y-6 text-secondary-300 leading-relaxed">
          <p>
            تستخدم المنصة ملفات JSON كمدخلات لإنشاء الاختبارات. يمكنك تخصيص طلبك (البرومت) أدناه ونسخه لأي أداة ذكاء اصطناعي (مثل ChatGPT أو Gemini) للحصول على ملف مطابق للمواصفات.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-secondary-800/30 p-5 rounded-2xl border border-white/5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-300 block">موضوع الاختبار</label>
              <input type="text" className="input-field py-2" value={topic} onChange={e => setTopic(e.target.value)} placeholder="مثال: الشبكات، التاريخ..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-300 block">مستوى الصعوبة</label>
              <select className="input-field py-2" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                 <option value="سهل">سهل</option>
                 <option value="متوسط">متوسط</option>
                 <option value="صعب">صعب</option>
                 <option value="متقدم جداً (خبير)">متقدم جداً (خبير)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-300 block">اختيار من متعدد</label>
              <input type="number" min="0" className="input-field py-2" value={mcqCount} onChange={e => setMcqCount(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-300 block">صح وخطأ</label>
              <input type="number" min="0" className="input-field py-2" value={tfCount} onChange={e => setTfCount(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-300 block">أسئلة مقالية</label>
              <input type="number" min="0" className="input-field py-2" value={essayCount} onChange={e => setEssayCount(Number(e.target.value))} />
            </div>
            <div className="space-y-2 flex items-center h-full pt-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={includeExplanations} onChange={e => setIncludeExplanations(e.target.checked)} className="w-5 h-5 rounded border-secondary-600 bg-secondary-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-secondary-900" />
                <span className="text-sm font-medium group-hover:text-white transition">شرح أسباب الإجابة</span>
              </label>
            </div>
          </div>

          <div className="bg-secondary-900/60 flex flex-col border border-secondary-700 rounded-xl relative overflow-hidden">
            <div className="bg-secondary-800/80 px-4 py-3 border-b border-secondary-700 flex flex-wrap items-center justify-between gap-3">
               <span className="text-sm font-medium text-secondary-300">البرومت المخصص (انسخه للـ AI):</span>
               <div className="flex items-center gap-2">
                 <button onClick={savePreferences} className="flex items-center gap-1.5 text-xs bg-secondary-700/80 hover:bg-secondary-600 text-white px-3 py-2 rounded-lg transition" title="حفظ الإعدادات للمرات القادمة">
                   {isSaved ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />}
                   <span>يحفظ التفضيلات</span>
                 </button>
                 <button 
                  className="flex items-center gap-1.5 text-xs bg-primary-600 hover:bg-primary-500 text-white px-3 py-2 rounded-lg transition"
                  onClick={handleCopy}
                 >
                   {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                   <span>{isCopied ? 'تم النسخ!' : 'نسخ النص'}</span>
                 </button>
               </div>
            </div>
            <div className="p-4 overflow-x-auto text-left" dir="ltr">
              <pre className="text-emerald-400/90 text-sm font-mono whitespace-pre-wrap selection:bg-emerald-500/30">
                {generatePrompt()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
