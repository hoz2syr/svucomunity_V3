import { MessageSquareDashed, FileStack, Network, Search, Camera, Brain, Rocket } from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';
import { GlassCard } from '../ui/GlassCard';
import { InteractiveMapSimulation } from '../InteractiveMap';

export const FeaturesSection = () => (
  <section id="features" className="py-24 px-4 bg-[var(--color-bg-secondary)]/20 border-y border-white/5 relative overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>
    
    <div className="max-w-7xl mx-auto relative z-10">
      <FadeIn className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-sm font-medium tracking-wide mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          كل المنصة بأدواتها
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">لوحة تحكم متكاملة لجامعتك</h2>
        <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">كل ما تحتاجه للنجاح، منظم وسهل الوصول ومصمم بذكاء ليرافقك في مسيرتك.</p>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
        <FadeIn delay={100} className="lg:col-span-2 h-full flex">
          <GlassCard className="p-8 md:p-10 flex flex-col justify-between w-full">
            <div className="flex flex-col md:flex-row gap-8 items-center h-full">
              <div className="w-full md:w-1/2 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                  <MessageSquareDashed size={24} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">مجموعات الواتساب بضغطة زر</h3>
                <p className="text-slate-400 font-light leading-relaxed">
                  ابحث عن مجموعات لمقررك وانضم فوراً، أو أنشئ مجموعة جديدة لكل مادة ليتجمع فيها زملائك دون إضاعة الوقت.
                </p>
              </div>
              <div className="w-full md:w-1/2 h-full relative min-h-[200px]">
                 <div className="absolute inset-0 bg-[var(--color-bg-primary)] rounded-xl border border-white/10 p-4 overflow-hidden">
                  <div className="w-full h-10 bg-white/5 rounded-lg mb-4 flex items-center px-4 border border-white/5">
                    <Search size={16} className="text-slate-500 mr-2" />
                    <div className="w-24 h-2 bg-slate-700/50 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors">
                         <div>
                           <div className="w-16 h-3 bg-white/20 rounded-full mb-2"></div>
                           <div className="w-10 h-2 bg-white/10 rounded-full"></div>
                         </div>
                         <div className="bg-[#25D366]/20 text-[#25D366] px-3 py-1.5 rounded-lg text-xs font-bold">انضم</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={200} className="h-full flex">
          <GlassCard className="p-8 md:p-10 flex flex-col w-full h-full">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
              <FileStack size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">المعرفة المنظمة</h3>
            <p className="text-slate-400 font-light leading-relaxed mb-8 flex-grow">
              تصفح مصادر المقررات، الفيديوهات السابقة، والملفات المرفوعة من الطلاب للملخصات.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mt-auto">
               {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="w-6 h-6 rounded bg-indigo-500/20 mb-2"></div>
                    <div className="w-10 h-1.5 bg-white/20 rounded-full mb-1"></div>
                    <div className="w-14 h-1.5 bg-white/10 rounded-full"></div>
                  </div>
               ))}
            </div>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={300} className="h-full flex">
          <GlassCard className="p-8 md:p-10 flex flex-col w-full h-full group overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                <Brain size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">الذكاء الاصطناعي</h3>
              <p className="text-slate-400 font-light leading-relaxed">
                ارفع صورة جدولك، وهو يستخرج مقرراتك تلقائياً كالسحر ليقترح لك مجموعاتك بخطوة واحدة.
              </p>
              <div className="mt-8 flex justify-center items-center py-6 bg-white/5 border border-white/10 text-center border-dashed rounded-xl">
                <Camera size={32} className="text-slate-500" />
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={400} className="lg:col-span-3">
          <GlassCard className="flex flex-col w-full overflow-hidden">
            <div className="p-8 md:p-10 flex flex-col md:flex-row gap-6 md:items-center justify-between z-10 relative">
              <div className="w-full md:w-2/3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                  <Network size={24} />
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">مخطط تفاعلي لأسبقيات المواد</h3>
                <p className="text-slate-400 font-light leading-relaxed md:text-lg max-w-3xl">
                  اكتشف مسارك الأكاديمي، افهم ما تفتحه كل مادة وما تتطلبه، بنظرة واحدة على خريطة البرنامج المتكاملة.
                </p>
              </div>
              <div className="w-full md:w-1/3 flex md:justify-end">
                <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                  جرب المخطط الآن <Rocket size={18} />
                </button>
              </div>
            </div>
            <div className="w-full h-[450px] md:h-[600px] relative bg-gradient-to-br from-[#040610] to-[#070b1a] border-t border-white/5 mt-4">
              <InteractiveMapSimulation />
            </div>
          </GlassCard>
        </FadeIn>
      </div>
    </div>
  </section>
);
