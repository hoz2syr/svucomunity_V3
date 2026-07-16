import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading, session } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400 text-lg">جاري التحقق من الصلاحيات...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
