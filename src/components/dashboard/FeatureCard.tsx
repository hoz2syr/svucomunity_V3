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

const accentConfig: Record<Accent, { bg: string; iconBg: string; iconColor: string; link: string; linkHover: string; hoverBg: string }> = {
  info: {
    bg: 'bg-[var(--color-info-light)]',
    iconBg: 'bg-[var(--color-info)]',
    iconColor: 'text-white',
    link: 'text-[var(--color-info-400)]',
    linkHover: 'group-hover:text-[var(--color-info-300)]',
    hoverBg: 'hover:bg-[rgba(6,182,212,0.08)]',
  },
  warning: {
    bg: 'bg-[var(--color-warning-light)]',
    iconBg: 'bg-[var(--color-warning)]',
    iconColor: 'text-white',
    link: 'text-[var(--color-warning-400)]',
    linkHover: 'group-hover:text-[var(--color-warning-300)]',
    hoverBg: 'hover:bg-[rgba(245,158,11,0.08)]',
  },
  primary: {
    bg: 'bg-[rgba(99,102,241,0.1)]',
    iconBg: 'bg-[var(--color-indigo-500)]',
    iconColor: 'text-white',
    link: 'text-[var(--color-indigo-400)]',
    linkHover: 'group-hover:text-[var(--color-indigo-300)]',
    hoverBg: 'hover:bg-[rgba(99,102,241,0.08)]',
  },
  success: {
    bg: 'bg-[var(--color-success-light)]',
    iconBg: 'bg-[var(--color-success)]',
    iconColor: 'text-white',
    link: 'text-[var(--color-success-400)]',
    linkHover: 'group-hover:text-[var(--color-success-300)]',
    hoverBg: 'hover:bg-[rgba(16,185,129,0.08)]',
  },
  danger: {
    bg: 'bg-[var(--color-danger-light)]',
    iconBg: 'bg-[var(--color-rose-500)]',
    iconColor: 'text-white',
    link: 'text-[var(--color-rose-400)]',
    linkHover: 'group-hover:text-[var(--color-rose-300)]',
    hoverBg: 'hover:bg-[rgba(244,63,94,0.08)]',
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
        className={`group relative flex flex-col rounded-[var(--radius-card)] bg-[var(--color-bg-card)] overflow-hidden transition-all duration-200 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 h-full ${theme.hoverBg}`}
      >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${theme.bg}`} />

        <div className="relative z-10 flex flex-col gap-5 h-full p-6">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-105 ${theme.iconBg} ${theme.iconColor}`}>
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

          <div className="mt-auto pt-2">
            <span className={`inline-flex items-center gap-2 text-sm font-bold transition-colors duration-300 ${theme.link} ${theme.linkHover}`}>
              {linkLabel}
              <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export { FeatureCard };
export type { FeatureCardProps };
