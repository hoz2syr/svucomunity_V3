import { FadeIn } from '../ui/FadeIn';
import { useCountUp } from '../../hooks/useCountUp';

const STATS = [
  { label: "+500 طالب مسجل", end: 500 },
  { label: "+80 مجموعة دراسية", end: 80 },
  { label: "+120 مقرر مفهرس", end: 120 },
];

const StatPill = ({ label, end, delay }: { label: string; end: number; delay: number }) => {
  const { count, start } = useCountUp({ end, duration: 2200, delay, startOnView: true });

  return (
    <FadeIn delay={delay} className="inline-block">
      <div
        className="px-6 py-3 rounded-full bg-[var(--color-bg-secondary)] border border-white/10 text-indigo-200 font-medium shadow-md"
        ref={(el) => {
          if (el) {
            const observer = new IntersectionObserver(
              ([entry]) => {
                if (entry.isIntersecting) start();
              },
              { threshold: 0.5 }
            );
            observer.observe(el);
            return () => observer.disconnect();
          }
        }}
      >
        <span className="text-white font-bold">{count.toLocaleString('en-US')}</span> {label.replace(/^\d+\s*/, '')}
      </div>
    </FadeIn>
  );
};

export const SolutionBridge = () => (
  <section className="py-24 px-4 w-full">
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
          <StatPill key={i} label={s.label} end={s.end} delay={200 + i * 200} />
        ))}
      </div>
    </div>
  </section>
);
