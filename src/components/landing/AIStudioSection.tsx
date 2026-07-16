import { Scan, Image, PenLine, Calculator, BarChart3, FileText, Sparkles } from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';

const FEATURES = [
  { icon: Scan, title: 'OCR حديث', desc: 'نظام تعرف ضوئي على الحروف يدعم العربية بدقة عالية' },
  { icon: Image, title: 'معالجة الصور', desc: 'تحسين وتنظيف الصور المرفوعة لإخراج احترافي' },
  { icon: PenLine, title: 'كتابة يدوية ذكية', desc: 'الأوراق المكتوبة بخط اليد تتحول إلى ملفات رقمية جاهزة للتعديل' },
  { icon: Calculator, title: 'معادلات رياضية', desc: 'دعم احترافي للمعادلات مع الحفاظ على التنسيق الأصلي' },
  { icon: BarChart3, title: 'مخططات بيانية', desc: 'تحويل البيانات المرئية إلى مخططات قابلة للتعديل' },
  { icon: FileText, title: 'ملفات منظمة', desc: 'تحويل الأوراق الورقية إلى ملفات رقمية منظمة وجاهزة للاستخدام' },
];

export const AIStudioSection = () => {
  return (
    <section id="ai-studio" className="py-24 px-4 text-center w-full relative border-y border-white/5">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <FadeIn direction="down">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium tracking-wide mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            تحويل الأوراق إلى ملفات رقمية &nbsp;•&nbsp; AI Studio
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
            من الورق إلى الرقمية &mdash; في ثوانٍ
          </h2>
          <p className="text-xl text-slate-400 font-light max-w-3xl mx-auto leading-relaxed mb-6">
            استوديو ذكاء اصطناعي متكامل يقرأ أوراقك، يفهم محتواها، ويحولها إلى ملفات رقمية منظمة وجاهزة للتعديل — مع دعم احترافي للمعادلات والمخططات والكتابة اليدوية.
          </p>
          <p className="text-lg text-slate-500 font-light max-w-2xl mx-auto leading-relaxed mb-16">
            قيد التطوير — نعمل على بناء تجربة تحويل ذكية تجمع بين OCR الحديث، معالجة الصور، وإنتاج المخططات والمعادلات تلقائياً.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {FEATURES.map((item, i) => (
            <FadeIn key={i} delay={i * 120} direction="up" className="h-full">
              <div className="group h-full rounded-2xl bg-[var(--color-bg-primary)] border border-white/8 p-6 md:p-8 flex flex-col items-start text-right hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-5 group-hover:bg-indigo-500/25 transition-colors">
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 font-light leading-relaxed">{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={500} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8">
            <div className="w-14 h-14 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Sparkles size={28} />
            </div>
            <div className="text-right">
              <h4 className="text-white font-bold text-lg mb-1">أخبرنا بماذا تفكر</h4>
              <p className="text-slate-400 font-light text-sm md:text-base">
                AI Studio قيد البناء — وسيتم إطلاقه قريباً. يمكنك اقتراح ميزات إضافية أو سيناريوهات استخدام تهمك.
              </p>
            </div>
            <a
              href="#join"
              className="shrink-0 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md whitespace-nowrap"
            >
              اقترح ميزة
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
