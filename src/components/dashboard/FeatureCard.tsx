import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  linkTo: string;
  linkLabel: string;
  index?: number;
};

const FeatureCard = ({
  title,
  description,
  icon,
  iconBg,
  iconColor,
  linkTo,
  linkLabel,
  index = 0,
}: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
  >
    <Link
      to={linkTo}
      className="group relative block h-full rounded-3xl bg-[#0a1020]/80 backdrop-blur-2xl border border-cyan-500/10 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/25 hover:shadow-[0_25px_50px_-12px_rgba(34,211,238,0.22)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 animate-border-glow"
    >
      <div className="absolute -inset-px bg-gradient-to-br from-cyan-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-md mix-blend-screen pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-5 h-full">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundColor: iconBg }}
        >
          <span className="[&>svg]:h-6 [&>svg]:w-6" style={{ color: iconColor }}>
            {icon}
          </span>
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
          <span className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 transition-colors duration-300 group-hover:text-cyan-300">
            {linkLabel}
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
          </span>
        </div>
      </div>
    </Link>
  </motion.div>
);

export { FeatureCard };
export type { FeatureCardProps };
