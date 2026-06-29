import { MessageSquareDashed, FileStack, Network } from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';
import { GlassCard } from '../ui/GlassCard';

const PROBS = [
  { icon: MessageSquareDashed, title: "التيه بين المجموعات", desc: "تضيع ساعات في البحث عن شركاء للمشاريع والوظائف الفصلية عبر واتساب وتيليغرام." },
  { icon: FileStack, title: "تشتت المصادر", desc: "ملفات الدراسة والفيديوهات والشروحات موزعة على عشرات المحادثات ولا يوجد مكان مركزي." },
  { icon: Network, title: "الاسبقيات المتشابكة", desc: "يصعب معرفة ما يجب دراسته أولاً وأي مواد تفتح لك أبواب التخصص والتقدم." },
];
const DIRECTIONS = ['left', 'down', 'right'] as const;

export const ProblemsSection = () => (
   <section id="problems" className="pt-32 pb-24 px-4 w-full max-w-6xl mx-auto">
    <FadeIn direction="down">
      <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-slate-100">هل تعاني من هذا كل فصل؟</h2>
    </FadeIn>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
      {PROBS.map((p, i) => (
        <FadeIn key={i} delay={i * 150} direction={DIRECTIONS[i]} scale className="w-full h-full">
           <GlassCard className="p-8 flex flex-col items-center text-center h-full group !bg-[var(--color-bg-primary)]/60 hover:!bg-[var(--color-bg-primary)]/80">
             <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 group-hover:bg-[var(--color-info-light)] group-hover:text-[var(--color-info-400)] transition-all duration-300 border border-white/5 relative">
               <div className="absolute inset-0 bg-[var(--color-info-400)]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <p.icon size={32} strokeWidth={1.5} className="relative z-10" />
             </div>
             <h3 className="text-xl font-bold mb-4 text-indigo-100">{p.title}</h3>
             <p className="text-slate-400 leading-relaxed text-sm font-light">{p.desc}</p>
           </GlassCard>
        </FadeIn>
      ))}
    </div>
  </section>
);
