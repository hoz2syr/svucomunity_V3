import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
  linkTo: string;
  linkLabel: string;
  index?: number;
};

const FeatureCard = ({
  title,
  description,
  icon,
  iconBgClass,
  iconColorClass,
  linkTo,
  linkLabel,
  index = 0,
}: FeatureCardProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      animate={reducedMotion ? false : { opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.4, delay: index * 0.1 }}
    >
    <Link
      to={linkTo}
      className="group relative block h-full rounded-3xl bg-[var(--color-bg-secondary)]/80 backdrop-blur-2xl border border-[var(--color-info)]/10 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--color-info-400)]/25 hover:shadow-[0_25px_50px_-12px_rgba(34,211,238,0.22)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-400)]/60 animate-border-glow"
    >
      <div className="absolute -inset-px bg-gradient-to-br from-[var(--color-info-400)]/10 to-[var(--color-purple-400)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-md mix-blend-screen pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-5 h-full">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-110 ${iconBgClass}`}
          style={{ color: iconColorClass }}
        >
          {icon}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-extrabold text-white leading-snug tracking-wide">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-400">
            {description}
          </p>
        </div>

        <div className="mt-auto">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-info-400)] transition-colors duration-300 group-hover:text-[var(--color-info-300)]">
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
