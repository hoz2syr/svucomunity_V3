/**
 * @module components/GuestRoute
 *
 * GuestRoute allows access to BOTH authenticated users AND guest-mode users.
 *
 * DESIGN DECISION — this is intentional for this project:
 *
 *   The project supports two user personas:
 *     1. Registered users (with Supabase session)
 *     2. Guest users (via `GuestProvider` / sessionStorage)
 *
 *   Most features — exam creation, saved tests, dashboard — are available to
 *   BOTH personas. A separate `ProtectedRoute` component exists for routes
 *   that require a real Supabase account (e.g., payment, profile sync).
 *
 *   This means a visitor can access /dashboard and /exam — by design, not by
 *   accident. Guest data lives in localStorage (exam feature) and is isolated
 *   from registered-user data on the server side via RLS policies.
 *
 * Security notes:
 *   - Guest mode data is NOT synced to Supabase (exam.store.ts TODO pending).
 *   - All Supabase mutations require a valid session — guests cannot write to
 *     the server database.
 *   - When a guest logs in or registers, a migration path from localStorage
 *     to Supabase should be triggered (not yet implemented).
 *
 * @see ProtectedRoute — for routes that require a real authenticated session.
 * @see src/contexts/GuestContext.tsx — for guest mode lifecycle.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGuest } from '../contexts/GuestContext';

export const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const { isGuest } = useGuest();

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
