import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGuest } from '../contexts/GuestContext';

export const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const { isGuest, guestProfile } = useGuest();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060a1f]">
        <div className="text-cyan-400 text-lg">جاري التحقق من الجلسة...</div>
      </div>
    );
  }

  if (session) return <>{children}</>;
  if (isGuest) return <>{children}</>;

  return <Navigate to="/login" replace />;
};

export const useGuestProfile = () => {
  const { isGuest, guestProfile } = useGuest();
  return { isGuest, guestProfile };
};
