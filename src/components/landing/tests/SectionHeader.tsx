import { type ReactNode } from 'react';
import { FadeIn } from '../../ui/FadeIn';

interface SectionHeaderProps {
  badge: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export const SectionHeader = ({ badge, title, description, action }: SectionHeaderProps) => (
  <FadeIn className="text-center mb-10 max-w-3xl mx-auto">
    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.02] border border-[#131315] text-[11px] font-medium tracking-[0.04em] text-zinc-500 mb-6 uppercase">
      {badge}
    </div>
    <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-zinc-50 mb-5 leading-tight">
      {title}
    </h2>
    <p className="text-lg md:text-xl text-zinc-500 leading-relaxed max-w-2xl mx-auto">{description}</p>
    {action}
  </FadeIn>
);
