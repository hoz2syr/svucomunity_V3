import { Link } from 'react-router-dom';
import { Share2, LogIn, X } from 'lucide-react';

interface GuestSharePromptProps {
  testTitle?: string;
  open?: boolean;
  onClose?: () => void;
}

export const GuestSharePrompt = ({ testTitle, open = true, onClose }: GuestSharePromptProps) => {
  if (!open) return null;

  const content = (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/15">
      <div className="flex items-start gap-2">
        <Share2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-cyan-200/80 leading-relaxed">
          {testTitle ? (
            <>
              الاختبار <span className="text-white font-medium">"{testTitle}"</span> محفوظ على هذا الجهاز فقط.
              سجّل الدخول لمشاركته أو نشره.
            </>
          ) : (
            'الاختبار محفوظ على هذا الجهاز فقط. سجّل الدخول لمشاركته أو نشره.'
          )}
        </p>
      </div>
      <Link
        to="/login"
        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors cursor-pointer"
      >
        <LogIn className="w-3.5 h-3.5" />
        تسجيل الدخول للمشاركة
      </Link>
    </div>
  );

  if (!onClose) return content;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-[var(--color-bg-primary)] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden" dir="rtl">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="text-base font-bold text-white">مشاركة الاختبار</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]/80 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 pt-0">
          {content}
        </div>
      </div>
    </div>
  );
};
