"use client";

import { Link } from 'react-router-dom';
import { Sparkles, Box, Settings, Copy, CheckCircle2, Save, HelpCircle } from 'lucide-react';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { usePromptPreferences, usePromptGenerator } from '../hooks';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

export default function Home() {
  const { prefs, update, save, isSaved } = usePromptPreferences();
  const prompt = usePromptGenerator(prefs);
  const { isCopied, copy } = useCopyToClipboard(prompt);

  return (
    <div className="flex flex-col gap-12 animation-fade-in-up pb-16">
      <div className="text-center max-w-3xl mx-auto space-y-6 mt-8">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            أنشئ اختبارات احترافية
          </h1>
          <div className="relative group">
            <HelpCircle className="w-6 h-6 text-secondary-400 cursor-help" />
            <div className="absolute top-full left-0 mt-2 w-72 p-3 bg-[var(--color-bg-elevated)] border border-secondary-700 rounded-xl text-xs text-secondary-300 leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-xl">
              <strong className="text-white mb-1 block">لماذا JSON؟</strong>
              JSON هو التنسيق الموثوب الوحيد اليوم الذي يولّده الذكاء الاصطناعي بدقة عالية، ويتحقق منه آلياً بدون مكتبات خارجية، ويتعامل معه المتصفح مباشرة عبر <code className="text-emerald-400">JSON.parse</code> — مما يجعله الجسر الأمثل بين الـ AI والمنصة.
            </div>
          </div>
        </div>
        <p className="text-secondary-400 text-lg leading-relaxed">
          منصة متكاملة لبناء الاختبارات من متعدد والصح والخطأ، مع خيارات تصدير متقدمة كـ PDF منظم للطباعة والتخصيص الكامل للأسئلة والإجابات والشروحات.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <PrimaryButton to="/exam/create" className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span>توليد اختبار جديد</span>
        </PrimaryButton>
        <Link to="/exam/saved" className="btn-glass flex items-center gap-2">
          <Box className="w-5 h-5" />
          <span>عرض الاختبارات السابقة</span>
        </Link>
      </div>

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

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 bg-[var(--color-bg-elevated)]/30 p-4 sm:p-5 rounded-2xl border border-white/5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-300 block">موضوع الاختبار</label>
              <input type="text" className="input-field py-2 sm:py-2.5 text-sm sm:text-base" value={prefs.topic} onChange={e => update('topic', e.target.value)} placeholder="مثال: الشبكات، التاريخ..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-300 block">مستوى الصعوبة</label>
              <select className="input-field py-2 sm:py-2.5 text-sm sm:text-base w-full" value={prefs.difficulty} onChange={e => update('difficulty', e.target.value)}>
                <option value="سهل">سهل</option>
                <option value="متوسط">متوسط</option>
                <option value="صعب">صعب</option>
                <option value="متقدم جداً (خبير)">متقدم جداً (خبير)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-300 block">اختيار من متعدد</label>
              <input type="number" min="0" max="100" className="input-field py-2 sm:py-2.5 text-sm sm:text-base" value={prefs.mcqCount} onChange={e => update('mcqCount', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-300 block">صح وخطأ</label>
              <input type="number" min="0" max="100" className="input-field py-2 sm:py-2.5 text-sm sm:text-base" value={prefs.tfCount} onChange={e => update('tfCount', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-300 block">أسئلة مقالية</label>
              <input type="number" min="0" max="50" className="input-field py-2 sm:py-2.5 text-sm sm:text-base" value={prefs.essayCount} onChange={e => update('essayCount', Number(e.target.value))} />
            </div>
            <div className="space-y-2 flex items-center h-full pt-6 sm:pt-8">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={prefs.includeExplanations} onChange={e => update('includeExplanations', e.target.checked)} className="w-5 h-5 rounded border-secondary-600 bg-[var(--color-bg-elevated)] text-primary-500 focus:ring-primary-500 focus:ring-offset-secondary-900" />
                <span className="text-sm font-medium group-hover:text-white transition">شرح أسباب الإجابة</span>
              </label>
            </div>
          </div>

           <div className="bg-[var(--color-bg-primary)]/60 flex flex-col border border-secondary-700 rounded-xl relative overflow-hidden">
             <div className="bg-[var(--color-bg-elevated)]/80 px-4 py-3 border-b border-secondary-700 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium text-secondary-300">البرومت المخصص (انسخه للـ AI):</span>
              <div className="flex items-center gap-2">
                <button onClick={save} className="flex items-center gap-1.5 text-xs bg-secondary-700/80 hover:bg-secondary-600 text-white px-3 py-2 rounded-lg transition" title="حفظ الإعدادات للمرات القادمة">
                  {isSaved ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />}
                  <span>يحفظ التفضيلات</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs bg-primary-600 hover:bg-primary-500 text-white px-3 py-2 rounded-lg transition" onClick={copy}>
                  {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'تم النسخ!' : 'نسخ النص'}</span>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-x-auto" dir="rtl">
              <pre className="text-emerald-400/90 text-sm font-mono whitespace-pre-wrap selection:bg-emerald-500/30">
                {prompt}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
