import { Link } from 'react-router-dom';
import { useInView } from '../../hooks/useInView';
import { GuestButton } from '../shared/GuestButton';

export const FinalCTASection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section id="join" ref={ref} className={`py-32 px-4 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col items-center text-center ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
       <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight max-w-4xl leading-tight">ابدأ رحلتك الجامعية بشكل صحيح</h2>
       <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl font-light">سجّل الآن وانضم إلى مجتمع طلاب تقنية المعلومات في الجامعة السورية الافتراضية.</p>

        <Link to="/register" className="shimmer-sweep bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-secondary-500)] text-white font-bold text-xl px-12 py-5 rounded-full shadow-[var(--shadow-glow-cyan-30)] hover:scale-105 hover:shadow-[var(--shadow-glow-cyan-50)] transition-all duration-300 mb-8 inline-block select-none cursor-pointer">
         إنشاء حساب مجاني
       </Link>

       <GuestButton className="mb-8" label="تجربة المخطط كزائر" />

       <div className="text-slate-400 font-medium">
         لديك حساب بالفعل؟ <Link to="/login" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/30 hover:decoration-cyan-300 transition-colors mr-1">سجّل الدخول &rarr;</Link>
       </div>
    </section>
  );
};
