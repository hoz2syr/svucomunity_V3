import { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';

export const HeroAddition = () => {
  const [showSub, setShowSub] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowSub(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full sm:w-[95%] max-w-4xl mx-auto flex flex-col items-center mt-12 mb-6 z-20 pointer-events-auto relative overflow-hidden p-5 sm:p-8 md:p-12">
      <div className="h-16 overflow-hidden flex justify-center mb-4 relative z-10 w-full text-center">
         <p className="text-[1.1rem] sm:text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-cyan-300 via-white to-cyan-300 animate-typewriter inline-block drop-shadow-sm whitespace-nowrap">
           مجتمعك الجامعي — في مكان واحد
         </p>
      </div>

      <p className={`text-slate-300 max-w-2xl text-lg md:text-xl transition-all duration-700 font-light leading-relaxed mb-10 text-center relative z-10 ${showSub ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '600ms' }}>
        انضم إلى مجتمع طلاب تقنية المعلومات في الجامعة السورية الافتراضية، وشارك مجموعاتك ومقرراتك وجدول دراستك بكل سهولة، دون أن تتيه في محادثات الواتساب.
      </p>

      <div className={`flex flex-col sm:flex-row w-full sm:w-auto gap-4 transition-all duration-700 relative z-10 ${showSub ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '900ms' }}>
        <a href="#join" className="relative group inline-block w-full sm:w-auto">
          <div className="absolute inset-0 bg-[var(--color-info-400)] rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-[var(--color-bg-secondary)] group-hover:bg-[var(--color-bg-primary)] border border-cyan-400/50 text-white font-bold py-3.5 px-10 rounded-full transition-all duration-300 w-full text-center flex items-center justify-center gap-2">
            ابدأ الآن <Rocket size={18} className="text-cyan-400" />
          </div>
        </a>
        <a href="#features" className="border border-[var(--color-indigo-400)]/30 hover:border-[var(--color-indigo-400)]/50 hover:bg-[var(--color-indigo-600)]/20 bg-white/5 text-slate-100 font-bold py-3.5 px-10 rounded-full transition-all duration-300 w-full text-center block">
          اكتشف المنصة
        </a>
      </div>
    </div>
  );
};
