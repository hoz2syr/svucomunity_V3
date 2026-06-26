import { Lock, Globe } from 'lucide-react';

interface PrivacyBadgeProps {
  published: boolean;
}

export const PrivacyBadge = ({ published }: PrivacyBadgeProps) => {
  if (published) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[var(--color-success-light)] text-[var(--color-success-400)] text-xs font-medium px-2.5 py-1.5 rounded-lg border border-[var(--color-success-border)]">
        <Globe className="w-3.5 h-3.5" />
        <span>منشور</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 bg-[var(--color-bg-elevated)]/70 text-[var(--color-text-secondary)] text-xs font-medium px-2.5 py-1.5 rounded-lg border border-white/5">
      <Lock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
      <span>خاص</span>
    </span>
  );
};
