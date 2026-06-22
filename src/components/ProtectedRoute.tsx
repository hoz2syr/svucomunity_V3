/**
 * @module components/ProtectedRoute
 *
 * ProtectedRoute restricts access to authenticated users ONLY (Supabase session).
 *
 * Use this when a route must not be accessible by guest-mode users.
 * Currently no routes use this guard — all exam/dashboard routes use `GuestRoute`
 * which allows both registered and guest users.
 *
 * Usage:
 *   <ProtectedRoute>
 *     <SensitiveFeature />
 *   </ProtectedRoute>
 *
 * @see GuestRoute — for routes that allow both registered and guest users.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060a1f]">
        <div className="text-cyan-400 text-lg">جاري التحقق من الجلسة...</div>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
