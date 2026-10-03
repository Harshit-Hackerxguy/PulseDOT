import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

/** Gate for authenticated pages. Redirects to /login and remembers where the user was going. */
export function ProtectedRoute() {
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const authed = token !== null && isAuthenticated();

  // Clear stale (expired) sessions so the login page starts clean.
  useEffect(() => {
    if (token && !authed) logout();
  }, [token, authed, logout]);

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** Gate for /login and /signup — already-authenticated users go straight home. */
export function PublicOnlyRoute() {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (token && isAuthenticated()) return <Navigate to="/" replace />;
  return <Outlet />;
}
