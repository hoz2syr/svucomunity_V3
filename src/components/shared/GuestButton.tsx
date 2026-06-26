import { useNavigate } from 'react-router-dom';
import { useGuest } from '../../contexts/GuestContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserRound } from 'lucide-react';

type GuestButtonProps = {
  className?: string;
  label?: string;
};

export const GuestButton = ({ className = '', label = 'تجربة المخطط كزائر' }: GuestButtonProps) => {
  const navigate = useNavigate();
  const { enableGuestMode } = useGuest();
  const { clearError } = useAuth();

  const handleClick = () => {
    clearError();
    enableGuestMode();
    navigate('/dashboard', { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.98] ${className}`}
    >
      <UserRound className="h-4 w-4 text-cyan-400" aria-hidden="true" />
      {label}
    </button>
  );
};
