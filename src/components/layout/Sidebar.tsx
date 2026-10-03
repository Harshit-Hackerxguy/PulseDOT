import { Heart, House, Library, LogOut, Music2, Plus, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCurrentTrack, usePlayerStore } from '../../store/usePlayerStore';
import { Equalizer } from '../ui/Equalizer';
import { Logo } from '../ui/Logo';

interface SidebarProps {
  onLogout: () => void;
}

interface NavItemProps {
  id: string;
  icon: LucideIcon;
  label: string;
  badge?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const navItemBase =
  'group relative flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300';
const navItemIdle =
  'text-white/60 hover:bg-neon/[0.08] hover:text-white hover:shadow-glow-inset hover:backdrop-blur-xl';
const navItemActive = 'bg-neon/[0.12] text-white shadow-glow-inset';

function ActiveBar() {
  return (
    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-neon shadow-glow-sm" />
  );
}

function NavButton({ id, icon: Icon, label, badge, onClick, disabled }: NavItemProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${navItemBase} ${navItemIdle} disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none`}
    >
      <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:text-neon" />
      <span>{label}</span>
      {badge && (
        <span className="ml-auto rounded-full border border-neon/30 bg-neon/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neon">
          {badge}
        </span>
      )}
    </button>
  );
}

function scrollToLibrary() {
  document.getElementById('local-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Sidebar({ onLogout }: SidebarProps) {
  const user = useAuthStore((s) => s.user);
  const trackCount = usePlayerStore((s) => s.tracks.length);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const current = useCurrentTrack();

  const initials = (user?.username ?? user?.email ?? '?').slice(0, 2).toUpperCase();

  return (
    <aside id="sidebar" className="hidden w-72 shrink-0 flex-col gap-2 md:flex">
      {/* Primary nav */}
      <nav className="panel glass p-3" aria-label="Main">
        <div className="px-4 pb-4 pt-2">
          <Logo size="sm" />
        </div>
        <NavLink
          id="nav-home"
          to="/"
          end
          className={({ isActive }) => `${navItemBase} ${isActive ? navItemActive : navItemIdle}`}
        >
          {({ isActive }) => (
            <>
              {isActive && <ActiveBar />}
              <House
                className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'text-neon drop-shadow-[0_0_6px_rgba(29,185,84,0.8)]' : 'group-hover:text-neon'
                }`}
              />
              <span>Home</span>
            </>
          )}
        </NavLink>
        <NavButton id="nav-search" icon={Search} label="Search" badge="Soon" disabled />
      </nav>

      {/* Library */}
      <section className="panel glass flex min-h-0 flex-1 flex-col p-3" aria-label="Your library">
        <div className="flex items-center justify-between pr-2">
          <NavButton id="nav-library" icon={Library} label="Your Library" onClick={scrollToLibrary} />
          <button
            id="sidebar-create-playlist"
            type="button"
            className="icon-btn h-8 w-8 shrink-0 hover:bg-neon/10 hover:text-neon hover:shadow-glow-xs"
            aria-label="Create playlist"
            title="Create playlist (coming soon)"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex-1 space-y-1 overflow-y-auto pr-1">
          <button
            id="sidebar-liked-songs"
            type="button"
            className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-all duration-300 hover:bg-white/[0.05]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-indigo-600 to-neon-700 shadow-lg">
              <Heart className="h-5 w-5 text-white" fill="currentColor" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">Liked Songs</span>
              <span className="block truncate text-xs text-white/50">Playlist · Synced soon</span>
            </span>
          </button>

          <button
            id="sidebar-local-files"
            type="button"
            onClick={scrollToLibrary}
            className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-all duration-300 hover:bg-neon/[0.08] hover:shadow-glow-inset"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-neon/30 bg-neon/10 shadow-glow-xs">
              <Music2 className="h-5 w-5 text-neon" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">Local Files</span>
              <span className="block truncate text-xs text-white/50">
                {trackCount > 0 ? `${trackCount} track${trackCount === 1 ? '' : 's'} on this device` : 'Load music from your device'}
              </span>
            </span>
            {current && <Equalizer playing={isPlaying} className="mr-2" />}
          </button>
        </div>
      </section>

      {/* Account */}
      <section className="panel glass flex items-center gap-3 p-3" aria-label="Account">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neon-gradient font-display text-sm font-bold text-black shadow-glow-sm">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{user?.username ?? 'Listener'}</p>
          <p className="truncate text-xs text-white/50">{user?.email}</p>
        </div>
        <button
          id="sidebar-logout"
          type="button"
          onClick={onLogout}
          className="icon-btn h-9 w-9 hover:bg-red-500/10 hover:text-red-300"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </section>
    </aside>
  );
}
