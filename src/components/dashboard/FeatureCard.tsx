import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type Accent = 'info' | 'warning' | 'primary' | 'success' | 'danger';

type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
  linkLabel: string;
  accent?: Accent;
  index?: number;
};

const accentConfig: Record<Accent, { 
  iconGradient: string; 
  iconColor: string; 
  borderTop: string; 
  hoverBg: string; 
  linkColor: string; 
  linkHoverColor: string;
}> = {
  info: {
    iconGradient: 'from-cyan-500 to-cyan-600',
    iconColor: 'text-white',
    borderTop: 'border-t-cyan-500',
    hoverBg: 'hover:bg-[rgba(6,182,212,0.06)]',
    linkColor: 'text-cyan-400',
    linkHoverColor: 'group-hover:text-cyan-300',
  },
  warning: {
    iconGradient: 'from-amber-500 to-amber-600',
    iconColor: 'text-white',
    borderTop: 'border-t-amber-500',
    hoverBg: 'hover:bg-[rgba(245,158,11,0.06)]',
    linkColor: 'text-amber-400',
    linkHoverColor: 'group-hover:text-amber-300',
  },
  primary: {
    iconGradient: 'from-indigo-500 to-indigo-600',
    iconColor: 'text-white',
    borderTop: 'border-t-indigo-500',
    hoverBg: 'hover:bg-[rgba(99,102,241,0.06)]',
    linkColor: 'text-indigo-400',
    linkHoverColor: 'group-hover:text-indigo-300',
  },
  success: {
    iconGradient: 'from-emerald-500 to-emerald-600',
    iconColor: 'text-white',
    borderTop: 'border-t-emerald-500',
    hoverBg: 'hover:bg-[rgba(16,185,129,0.06)]',
    linkColor: 'text-emerald-400',
    linkHoverColor: 'group-hover:text-emerald-300',
  },
  danger: {
    iconGradient: 'from-rose-500 to-rose-600',
    iconColor: 'text-white',
    borderTop: 'border-t-rose-500',
    hoverBg: 'hover:bg-[rgba(244,63,94,0.06)]',
    linkColor: 'text-rose-400',
    linkHoverColor: 'group-hover:text-rose-300',
  },
};

const FeatureCard = ({
  title,
  description,
  icon,
  linkTo,
  linkLabel,
  accent = 'primary',
  index = 0,
}: FeatureCardProps) => {
  const reducedMotion = useReducedMotion();
  const theme = accentConfig[accent];

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      animate={reducedMotion ? false : { opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        to={linkTo}
        className={`group relative flex flex-col rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-white/8 ${theme.borderTop} overflow-hidden transition-all duration-200 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-400/70 h-full ${theme.hoverBg}`}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/[0.03] to-transparent" />

        <div className="relative z-10 flex flex-col gap-5 h-full p-6">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.iconGradient} ${theme.iconColor} shadow-lg transition-transform duration-300 group-hover:scale-105`}>
            {icon}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-extrabold text-white leading-snug tracking-wide">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {description}
            </p>
          </div>

          <div className="mt-auto pt-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-sm font-bold transition-all duration-200 ${theme.linkColor} ${theme.linkHoverColor} group-hover:border-white/20 group-hover:bg-white/5`}>
              {linkLabel}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export { FeatureCard };
export type { FeatureCardProps };
