import { FadeIn } from '../ui/FadeIn';

const STATS = [
  "+500 طالب مسجل",
  "+80 مجموعة دراسية",
  "+120 مقرر مفهرس",
];

export const SolutionBridge = () => (
  <section className="py-24 px-4 w-full bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent">
    <div className="max-w-4xl mx-auto text-center">
      <FadeIn>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium tracking-wide mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-indigo-400)]"></span>
          الحل
        </div>
        <h2 className="text-4xl md:text-6xl font-extrabold mb-8 text-white bg-clip-text text-transparent bg-gradient-to-l from-white to-slate-400">
          منصة واحدة.<br className="md:hidden" /> كل ما تحتاجه.
        </h2>
        <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-16">
          SVU Community تجمع مجموعاتك الدراسية، مقرراتك، جدولك، ومصادر التعلم في تجربة واحدة متكاملة.
        </p>
      </FadeIn>
      
      <div className="flex flex-wrap justify-center gap-4">
        {STATS.map((s, i) => (
          <FadeIn key={i} delay={200 + i * 200}>
              <div className="px-6 py-3 rounded-full bg-[var(--color-bg-secondary)] border border-cyan-800/40 text-cyan-200 font-medium shadow-[var(--shadow-glow-cyan-20)]">
               {s}
             </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);
