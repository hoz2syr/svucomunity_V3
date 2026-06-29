import { type ReactNode } from 'react';
import { FadeIn } from '../../ui/FadeIn';

interface TestsShowcaseCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  mockup?: ReactNode;
  className?: string;
  delay?: number;
  span?: string;
  noFade?: boolean;
}

export const TestsShowcaseCard = ({
  icon, title, description, mockup, className = '', delay = 0, span = '', noFade = false
}: TestsShowcaseCardProps) => {
  const card = (
    <div className={`group h-full rounded-2xl border border-white/8 bg-[var(--color-bg-primary)] shadow-[var(--shadow-card)] overflow-hidden relative transition-all duration-200 hover:-translate-y-1 hover:border-white/14`}>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-info-light)] blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/15 transition-colors pointer-events-none"></div>
      <div className="p-6 flex flex-col h-full relative z-10">
        {mockup && (
          <div className="mb-5 relative flex-shrink-0 rounded-xl border border-white/10 bg-[#0a0a0c] p-4 overflow-hidden">
            {mockup}
          </div>
        )}
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 transition-all duration-200 group-hover:text-indigo-300 group-hover:border-indigo-400/30 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-zinc-200 tracking-[-0.01em] mb-2">{title}</h3>
        <p className="text-[15px] text-zinc-400 leading-relaxed flex-grow">{description}</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );

  if (noFade) {
    return <div className={`h-full ${span} ${className}`}>{card}</div>;
  }

  return (
    <FadeIn delay={delay} scale className={`h-full ${span} ${className}`}>
      {card}
    </FadeIn>
  );
};
