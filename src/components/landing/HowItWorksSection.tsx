import { UserPlus, Camera, Users, Rocket } from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';
import { useInView } from '../../hooks/useInView';

const STEPS = [
  { num: '01', icon: UserPlus, title: 'سجّل حسابك', desc: 'أنشئ حسابك باستخدام بريدك الإلكتروني وبيانات الجامعة.', color: 'cyan' },
  { num: '02', icon: Camera, title: 'ارفع جدولك', desc: 'صوّر جدولك الفصلي وارفعه، الذكاء الاصطناعي يتولى الباقي.', color: 'indigo' },
  { num: '03', icon: Users, title: 'اعثر على مجموعتك', desc: 'شاهد المجموعات الدراسية المطابقة لمقرراتك وانضم بنقرة واحدة.', color: 'cyan' },
  { num: '04', icon: Rocket, title: 'تعاون وتقدّم', desc: 'شارك المصادر، تعرف على أسبقيات مقرراتك، وخطط لمسيرتك الأكاديمية.', color: 'indigo' },
];

export const HowItWorksSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  return (
    <section id="how" className="py-24 px-4 border-y border-indigo-950/50" ref={ref}>
        <div className="max-w-4xl mx-auto">
          <FadeIn direction="down" className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">كيف تبدأ؟</h2>
            <p className="text-xl text-cyan-400 font-medium">أربع خطوات فقط</p>
          </FadeIn>

          <div className="relative">
            <div className={`hidden md:block absolute right-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500 to-indigo-500 transform translate-x-1/2 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-top ${isInView ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`} />

            <div className="space-y-16 relative z-10">
              {STEPS.map((s, i) => {
                 const isEven = i % 2 !== 0;
                 const borderColor = s.color === 'cyan' ? 'border-cyan-500' : 'border-indigo-500';
                 const iconColor = s.color === 'cyan' ? 'text-cyan-400' : 'text-indigo-400';
                 return (
                  <FadeIn key={i} delay={i * 150} scale className={`flex flex-col md:flex-row items-center gap-4 md:gap-0`}>

                     <div className="hidden md:flex w-1/2 justify-end px-12 text-left" dir="ltr">
                        {!isEven && (
                          <div dir="rtl">
                            <h4 className="text-2xl font-bold text-white mb-3">{s.title}</h4>
                            <p className="text-slate-400 leading-relaxed">{s.desc}</p>
                          </div>
                        )}
                     </div>

                     <div className="relative flex justify-center w-full md:w-auto">
                         <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-[var(--color-bg-secondary)] border-2 ${borderColor} flex items-center justify-center shadow-md relative z-10 transition-all duration-500`}>
                         <s.icon size={26} className={iconColor} />
                       </div>
                       <div className={`absolute top-0 md:top-2 md:-right-8 text-6xl font-black text-slate-800/30 select-none pointer-events-none z-0`}>{s.num}</div>
                     </div>

                     <div className="hidden md:flex w-1/2 justify-start px-12 text-right">
                        {isEven && (
                          <div dir="rtl">
                            <h4 className="text-2xl font-bold text-white mb-3">{s.title}</h4>
                            <p className="text-slate-400 leading-relaxed">{s.desc}</p>
                          </div>
                        )}
                     </div>

                     <div className="md:hidden text-center px-4 mt-2" dir="rtl">
                        <h4 className="text-2xl font-bold text-white mb-2">{s.title}</h4>
                        <p className="text-slate-400">{s.desc}</p>
                     </div>

                  </FadeIn>
                 );
              })}
            </div>
          </div>
        </div>
      </section>
  );
};
