import { type FormEvent, type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AuthButton } from '../ui/AuthButton';
import { ServerError } from '../ui/ServerError';
import { ArrowRight } from 'lucide-react';
import { useParticleCanvas } from '../../hooks/useParticleCanvas';

type LogoGradient = 'from-cyan-400 to-indigo-500' | 'from-purple-500 to-indigo-500' | 'from-emerald-400 to-cyan-500';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkTo?: string;
  showBackLink?: boolean;
  onSubmit: (e: FormEvent) => void;
  submitText: string;
  loadingText?: string;
  isLoading: boolean;
  serverError: string;
  logoGradient: LogoGradient;
  googleButtonText: string;
  onGoogleClick: () => void;
}

const gradientShadow: Record<LogoGradient, string> = {
  'from-cyan-400 to-indigo-500': 'rgba(34,211,238,0.4)',
  'from-purple-500 to-indigo-500': 'rgba(168,85,247,0.4)',
  'from-emerald-400 to-cyan-500': 'rgba(52,211,153,0.4)',
};

export const AuthCard = ({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
  showBackLink = true,
  onSubmit,
  submitText,
  loadingText,
  isLoading,
  serverError,
  logoGradient,
  googleButtonText,
  onGoogleClick,
}: AuthCardProps) => {
  const { canvasRef, reducedMotion } = useParticleCanvas({
    particleCount: 80,
    enableTextAssemble: false,
  });

  const [googleLogoError, setGoogleLogoError] = useState(false);
  const shadowColor = gradientShadow[logoGradient];
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f2e] relative overflow-hidden font-sans" dir="rtl">
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block w-full h-full pointer-events-none z-0"
        />
      )}
      {reducedMotion && (
        <div className="absolute inset-0 bg-[#0a0f2e] pointer-events-none z-0" />
      )}
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center justify-center mb-5 group">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${logoGradient} flex items-center justify-center shadow-[0_0_30px_${shadowColor}] transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300`}>
              <span className="text-white font-extrabold text-2xl font-display">SVU</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{title}</h1>
          {subtitle && <p className="text-slate-400 text-sm mt-2 tracking-wide font-display">{subtitle}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-[0_0_40px_rgba(34,211,238,0.1)] relative"
        >
          <ServerError error={serverError} />

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            {children}

            <AuthButton
              type="submit"
              isLoading={isLoading}
              loadingText={loadingText}
              defaultText={submitText}
            />
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/60 text-slate-400">أو</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoogleClick}
            className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors shadow-sm"
          >
            {googleLogoError ? (
              <span className="text-sm font-bold text-slate-700">G</span>
            ) : (
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
                onError={() => setGoogleLogoError(true)}
              />
            )}
            {googleButtonText}
          </button>

          {footerText && footerLinkText && footerLinkTo && (
            <div className="mt-7 text-center">
              <span className="text-slate-400 text-sm">{footerText} </span>
              <Link to={footerLinkTo} className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors hover:underline underline-offset-4 decoration-cyan-400/30">
                {footerLinkText}
              </Link>
            </div>
          )}
        </motion.div>

        {showBackLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-6"
          >
            <Link to="/" className="text-slate-400 flex items-center justify-center gap-2 hover:text-white transition-colors text-sm group">
              <ArrowRight size={16} className="transition-transform group-hover:-translate-x-1" />
              العودة للرئيسية
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};
