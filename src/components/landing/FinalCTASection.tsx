import { Link } from 'react-router-dom';
import { FadeIn } from '../ui/FadeIn';
import { GuestButton } from '../shared/GuestButton';

export const FinalCTASection = () => {
  return (
      <section id="join" className="py-32 px-4 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center text-center">
         <FadeIn direction="down" delay={0}>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight max-w-4xl leading-tight">ابدأ رحلتك الجامعية بشكل صحيح</h2>
        </FadeIn>
        <FadeIn direction="down" delay={150}>
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl font-light">سجّل الآن وانضم إلى مجتمع طلاب تقنية المعلومات في الجامعة السورية الافتراضية.</p>
        </FadeIn>

        <FadeIn scale delay={300}>
          <Link to="/register" className="shimmer-sweep bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-secondary-500)] text-white font-bold text-xl px-12 py-5 rounded-full shadow-md hover:scale-105 hover:shadow-lg transition-all duration-200 mb-8 inline-block select-none cursor-pointer">
            إنشاء حساب مجاني
          </Link>
        </FadeIn>

        <FadeIn delay={400}>
          <GuestButton className="mb-8" label="تجربة المخطط كزائر" />
        </FadeIn>

        <FadeIn delay={500}>
          <div className="text-slate-400 font-medium">
             لديك حساب بالفعل؟ <Link to="/login" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-400/30 hover:decoration-indigo-300 transition-colors mr-1">سجّل الدخول &rarr;</Link>
          </div>
        </FadeIn>
      </section>
  );
};
