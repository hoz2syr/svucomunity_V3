import { Lock, Globe } from 'lucide-react';

interface PrivacyBadgeProps {
  published: boolean;
}

export const PrivacyBadge = ({ published }: PrivacyBadgeProps) => {
  if (published) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
        <Globe className="w-3.5 h-3.5" />
        <span>منشور</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 bg-secondary-800/70 text-secondary-300 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-white/5">
      <Lock className="w-3.5 h-3.5 text-secondary-400" />
      <span>خاص</span>
    </span>
  );
};
