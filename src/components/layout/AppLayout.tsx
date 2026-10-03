import { LogOut } from 'lucide-react';
import { useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { BottomPlayer } from '../player/BottomPlayer';
import { Logo } from '../ui/Logo';
import { Sidebar } from './Sidebar';

/** Authenticated shell: sidebar + scrollable main content + persistent player. */
export function AppLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const clearLibrary = usePlayerStore((s) => s.clearLibrary);

  const handleLogout = useCallback(() => {
    clearLibrary(); // stop playback and revoke blob URLs
    logout();
    navigate('/login', { replace: true });
  }, [clearLibrary, logout, navigate]);

  return (
    <div className="flex h-full flex-col bg-black">
      <div className="flex min-h-0 flex-1 gap-2 p-2">
        <Sidebar onLogout={handleLogout} />

        <main
          id="main-content"
          className="panel relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
        >
          {/* Ambient green wash at the top of the content area */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-neon/20 via-neon/[0.04] to-transparent"
          />

          {/* Mobile header (sidebar is hidden < md) */}
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-base-850/70 px-4 py-3 backdrop-blur-xl md:hidden">
            <Logo size="sm" />
            <button id="mobile-logout" type="button" onClick={handleLogout} className="btn-glass px-3 py-1.5 text-xs">
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </header>

          <div className="relative">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomPlayer />
    </div>
  );
}
