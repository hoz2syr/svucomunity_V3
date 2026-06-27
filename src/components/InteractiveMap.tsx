import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, X, MousePointer2 } from 'lucide-react';

export const InteractiveMapSimulation = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const nextStep = () => setStep((s) => (s + 1) % 6);

    switch (step) {
      case 0: timer = setTimeout(nextStep, 1000); break;
      case 1: timer = setTimeout(nextStep, 1000); break;
      case 2: timer = setTimeout(nextStep, 600); break;
      case 3: timer = setTimeout(nextStep, 300); break;
      case 4: timer = setTimeout(nextStep, 5000); break;
      case 5: timer = setTimeout(nextStep, 1000); break;
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [step]);
  
  const isTargetHovered = step >= 2 && step <= 4;
  const isZoomed = step >= 4;
  
  const cursorTop = step === 0 || step === 5 ? '80%' : '50%';
  const cursorLeft = step === 0 || step === 5 ? '80%' : '50%';
  const isCursorVisible = step < 4;

  interface MapNodeProps {
    title: string;
    code: string;
    top: string;
    left: string;
    isActive?: boolean;
    isCompleted: boolean;
  }

  const MapNode = ({ title, code, top, left, isActive, isCompleted }: MapNodeProps) => (
    <div 
      className={`absolute w-36 md:w-44 -translate-x-1/2 -translate-y-1/2 rounded-2xl p-4 border transition-all duration-500 backdrop-blur-xl flex flex-col items-center justify-center 
        ${isActive ? 'border-cyan-400 bg-[var(--color-bg-secondary)]/90 shadow-[var(--shadow-glow-cyan-40px)] scale-[1.15] z-20 ring-1 ring-cyan-400/50' : 
          isCompleted ? 'border-indigo-500/50 bg-[var(--color-bg-secondary)]/90 z-10 shadow-lg' : 
          'border-slate-700/60 bg-[var(--color-bg-overlay)]/90 opacity-70 z-10 grayscale-[0.5]'}`}
      style={{ top, left }}
    >
      <div className={`text-[10px] md:text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 mb-2.5 font-mono font-bold tracking-wide ${isActive ? 'bg-[var(--color-info-light)] text-[var(--color-info-400)]' : 'bg-[var(--color-bg-elevated)] text-slate-400'}`}>
         <BookOpen size={14} /> {code}
      </div>
      <h5 className={`font-extrabold text-center text-sm md:text-base mb-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>{title}</h5>
      {(isActive || isCompleted) && (
        <div className="flex gap-4 text-[10px] md:text-xs text-slate-400 mt-2 font-medium">
           <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md"><Calendar size={12}/> سنة 3</span>
           <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md"><Clock size={12}/> 5 سا</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-full bg-transparent overflow-hidden relative select-none">
        <div className="absolute inset-0 z-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className={`absolute inset-0 z-10 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] origin-center ${isZoomed ? 'scale-[1.15] md:-translate-x-[10%] -translate-y-[10%]' : 'scale-100 translate-x-0 translate-y-0'}`}>
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-xl" viewBox="0 0 400 300" preserveAspectRatio="none">
            <path d="M 100 75 H 150 V 150 H 200" stroke="var(--color-border-subtle)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 200 150 H 250 V 225 H 300" stroke="var(--color-border-subtle)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            <path d="M 100 75 H 150 V 150 H 200" stroke="var(--color-purple-500)" strokeOpacity="0.6" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-opacity duration-700 delay-300 ${isZoomed ? 'opacity-100' : 'opacity-0'}`} />
            <path d="M 200 150 H 250 V 225 H 300" stroke="var(--color-cyan-400)" strokeOpacity="0.6" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-opacity duration-700 delay-500 ${isZoomed ? 'opacity-100' : 'opacity-0'}`} />

            <path d="M 100 75 H 150 V 150 H 200" stroke="var(--color-purple-500)" strokeWidth="2.5" fill="none" strokeDasharray="8 8" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-opacity duration-700 delay-300 ${isZoomed ? 'opacity-100' : 'opacity-0'}`}>
               <animate attributeName="stroke-dashoffset" from="32" to="0" dur="0.8s" repeatCount="indefinite" />
            </path>
            <path d="M 200 150 H 250 V 225 H 300" stroke="var(--color-cyan-400)" strokeWidth="2.5" fill="none" strokeDasharray="8 8" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-opacity duration-700 delay-500 ${isZoomed ? 'opacity-100' : 'opacity-0'}`}>
               <animate attributeName="stroke-dashoffset" from="32" to="0" dur="0.8s" repeatCount="indefinite" />
            </path>
         </svg>

         <MapNode title="الجبر الخطي" code="BLA401" top="25%" left="25%" isCompleted={true} />
         <MapNode title="تحليل عددي" code="BNA401" top="50%" left="50%" isActive={isTargetHovered} isCompleted={true} />
         <MapNode title="البيانات" code="BCG601" top="75%" left="75%" isCompleted={false} />
       </div>

         <div 
           className={`absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-72 bg-[var(--color-bg-primary)]/80 backdrop-blur-2xl border border-white/10 shadow-[var(--shadow-elevated)] p-4 sm:p-5 rounded-3xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-30 flex flex-col ${isZoomed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}
           dir="rtl"
         >
         <div className="flex justify-between items-start mb-4 w-full">
           <div className="bg-[var(--color-info-light)] border border-[var(--color-info-border)] text-[var(--color-info-400)] text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md font-mono shrink-0">BNA401</div>
            <button aria-label="إغلاق لوحة المعلومات" className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-lg border border-white/5"><X size={14}/></button>
         </div>
         <h3 className="text-white font-extrabold text-base sm:text-lg mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-info-400)] shrink-0"></span>
            تحليل عددي
         </h3>
         
         <div className="grid grid-cols-2 gap-2 mb-4">
           <div className="bg-white/5 p-2 rounded-xl text-center border border-white/5">
             <div className="text-[10px] text-slate-400 mb-1 font-medium">السنة</div>
             <div className="font-bold text-white text-sm">الثالثة</div>
           </div>
           <div className="bg-white/5 p-2 rounded-xl text-center border border-white/5">
             <div className="text-[10px] text-slate-400 mb-1 font-medium">الساعات</div>
             <div className="font-bold text-white text-sm">5</div>
           </div>
         </div>

         <div className="flex flex-col gap-2 mt-auto">
           <div>
             <div className="bg-[var(--color-purple-600)]/10 border border-[var(--color-purple-400)]/10 text-slate-200 p-2 sm:p-2.5 rounded-xl flex justify-between items-center shadow-inner">
                <span className="text-[10px] sm:text-xs text-purple-400 font-bold flex items-center gap-1.5 truncate"><div className="w-1 h-1 rounded-full bg-[var(--color-purple-400)] shrink-0"></div> المتطلبات السابقة: <span className="text-slate-300 font-medium">الجبر الخطي</span></span>
                <span className="bg-[var(--color-purple-400)]/20 px-1.5 py-0.5 rounded-md text-[9px] text-[var(--color-purple-400)] font-mono font-bold shrink-0">BLA401</span>
             </div>
           </div>

           <div>
             <div className="bg-[var(--color-info)]/10 border border-[var(--color-info-border)] text-slate-200 p-2 sm:p-2.5 rounded-xl flex justify-between items-center shadow-inner">
                <span className="text-[10px] sm:text-xs text-cyan-400 font-bold flex items-center gap-1.5 truncate"><div className="w-1 h-1 rounded-full bg-[var(--color-info-400)] shrink-0"></div> يفتح المقررات: <span className="text-slate-300 font-medium">البيانات</span></span>
                <span className="bg-[var(--color-info-light)] px-1.5 py-0.5 rounded-md text-[9px] text-[var(--color-info-400)] font-mono font-bold shrink-0">BCG601</span>
             </div>
           </div>
         </div>
       </div>

        <div 
          className={`absolute pointer-events-none transition-all ${step === 1 || step === 5 ? 'duration-[1200ms] ease-in-out' : 'duration-150'} z-50 ${isCursorVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
             top: cursorTop, 
             left: cursorLeft,
             transform: `translate(-10px, -10px) ${step >= 3 ? 'scale(0.85)' : 'scale(1)'}`
          }}
        >
           <MousePointer2 className={`w-8 h-8 ${step >= 3 ? 'text-cyan-300 fill-cyan-400/20 drop-shadow-[var(--shadow-glow-cyan-60)]' : 'text-slate-200 fill-white/10 drop-shadow-lg'} transition-colors duration-300 transform -scale-x-100`} />
        </div>
    </div>
  );
};
