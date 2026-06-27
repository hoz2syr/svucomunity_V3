import { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Share2, Trophy } from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';

const FEATURES = [
  {icon: Brain, t: "توليد تلقائي للاختبارات بالذكاء الاصطناعي"},
  {icon: Share2, t: "مشاركة الاختبارات مع الزملاء"},
  {icon: Trophy, t: "نتائج ولوحة المتصدرين"}
];

export const ComingSoonSection = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section className="py-24 px-4 bg-[var(--color-bg-tertiary)] text-center w-full relative">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-medium tracking-wide mb-8">
             <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)] animate-pulse"></span>
             قريباً &nbsp;•&nbsp; Coming Soon
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">الاختبارات التفاعلية</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-16">
            ستتمكن قريباً من إنشاء اختبارات وكويزات لأي مقرر تلقائياً، مشاركتها مع زملائك، والتنافس معهم على أفضل النتائج — كل هذا داخل المنصة مباشرةً.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16 relative">
          {FEATURES.map((item, i) => (
             <FadeIn key={i} delay={i*200} blurLayer={true} className="h-full">
                <div className="group overflow-hidden rounded-2xl relative bg-[var(--color-bg-primary)] border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[160px] h-full">
                 <div className="absolute inset-0 bg-[var(--color-bg-secondary)]/60 backdrop-blur-[2px] transition-all duration-500 z-10 flex items-center justify-center pointer-events-none">
                    <div className="bg-[var(--color-bg-elevated)]/80 text-white text-xs px-3 py-1 rounded shadow-lg">قريباً</div>
                  </div>
                 <div className="relative z-0 text-center transition-all duration-500 opacity-40 group-hover:opacity-100 scale-95 group-hover:scale-100">
                   <item.icon size={32} className="text-slate-500 group-hover:text-cyan-400 mx-auto mb-4 transition-colors" />
                   <div className="font-bold text-slate-300 group-hover:text-white transition-colors">{item.t}</div>
                 </div>
                </div>
             </FadeIn>
          ))}
        </div>

        <FadeIn delay={400} className="max-w-md mx-auto">
          {isSubmitted ? (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-emerald-400 text-sm font-medium flex items-center justify-center gap-2"
            >
              تم تسجيل بريدك بنجاح! سنُعلمك عند الإطلاق.
            </motion.p>
          ) : (
            <form className="flex gap-2" onSubmit={handleNotifySubmit}>
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                required
                className="flex-1 bg-[var(--color-bg-primary)] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors text-right"
                dir="auto"
              />
              <button
                type="submit"
                className="shimmer-sweep bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-secondary-500)] text-white px-6 py-3 rounded-lg font-medium shadow-[var(--shadow-glow-cyan-30)] transition-colors whitespace-nowrap"
              >
                أبلغني عند الإطلاق
              </button>
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  );
};
