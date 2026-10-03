import {
  FolderOpen,
  HardDriveDownload,
  LoaderCircle,
  Pause,
  Play,
  Plus,
  Shuffle,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import { PlaylistCard } from '../components/home/PlaylistCard';
import { TrackList } from '../components/home/TrackList';
import { Alert } from '../components/ui/Alert';
import { MADE_FOR_YOU, RECENTLY_PLAYED } from '../data/playlists';
import { useLocalLibrary } from '../hooks/useLocalLibrary';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';
import type { Playlist } from '../types';
import { formatTime, getGreeting } from '../utils/format';

interface PlaylistSectionProps {
  id: string;
  title: string;
  subtitle: string;
  items: Playlist[];
  onPlay: (p: Playlist) => void;
}

function PlaylistSection({ id, title, subtitle, items, onPlay }: PlaylistSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-4 px-1">
        <div>
          <h2 id={`${id}-title`} className="font-display text-2xl font-bold tracking-tight text-white">
            {title}
          </h2>
          <p className="mt-1 text-sm text-white/50">{subtitle}</p>
        </div>
      </div>
      <div className="-mx-3 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {items.map((p, i) => (
          <PlaylistCard key={p.id} playlist={p} index={i} onPlay={onPlay} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const tracks = usePlayerStore((s) => s.tracks);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const clearLibrary = usePlayerStore((s) => s.clearLibrary);

  const {
    fileInputRef,
    folderInputRef,
    pickFiles,
    pickFolder,
    handleInputChange,
    addFiles,
    isLoading: isLibLoading,
    error: libError,
    lastAdded,
  } = useLocalLibrary();
  const [isDragging, setIsDragging] = useState(false);

  const hasTracks = tracks.length > 0;
  const totalDuration = useMemo(() => tracks.reduce((sum, t) => sum + (t.duration ?? 0), 0), [tracks]);

  const handlePlayAll = () => {
    if (currentIndex >= 0) togglePlay();
    else playTrack(shuffle ? Math.floor(Math.random() * tracks.length) : 0);
  };

  // Placeholder playlists play from the local library until the backend serves real catalogues.
  const handlePlaylistPlay = (p: Playlist) => {
    if (!hasTracks) {
      void pickFiles();
      return;
    }
    const seed = [...p.id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    playTrack(seed % tracks.length);
  };

  const onDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };
  const onDragLeave = (e: DragEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsDragging(false);
  };
  const onDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div className="px-4 pb-12 pt-6 sm:px-8 sm:pt-8">
      {/* Greeting */}
      <header className="animate-fade-in-up">
        <p className="text-sm font-medium text-neon/90">{getGreeting()}</p>
        <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Welcome back, <span className="text-gradient">{user?.username ?? 'listener'}</span>
        </h1>
      </header>

      {/* ── Local library ── */}
      <section id="local-library" aria-labelledby="local-library-title" className="mt-8 scroll-mt-20">
        <input
          ref={fileInputRef}
          id="local-files-input"
          type="file"
          accept="audio/*"
          multiple
          hidden
          onChange={handleInputChange}
        />
        <input
          ref={folderInputRef}
          id="local-folder-input"
          type="file"
          multiple
          hidden
          onChange={handleInputChange}
        />

        {/* Hero / drop zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition-all duration-500 sm:p-8 ${
            isDragging
              ? 'scale-[1.01] border-neon/70 bg-neon/[0.12] shadow-glow-lg'
              : 'border-neon/20 bg-gradient-to-br from-neon/[0.12] via-white/[0.03] to-transparent shadow-glow-inset'
          }`}
        >
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 animate-float rounded-full bg-neon/25 blur-[90px]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 animate-float-slow rounded-full bg-emerald-400/10 blur-[80px]" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/30 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neon">
                <Sparkles className="h-3 w-3" />
                Your device, your library
              </span>
              <h2 id="local-library-title" className="mt-4 font-display text-3xl font-bold tracking-tight text-white">
                {hasTracks ? 'Local Files' : 'Play music straight from your device'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {hasTracks
                  ? `${tracks.length} track${tracks.length === 1 ? '' : 's'}${
                      totalDuration ? ` · ${formatTime(totalDuration)} total` : ''
                    } — files never leave your computer.`
                  : 'Grant access to your audio files and Pulse will turn them into a playable library. Files stay on your device — nothing is uploaded.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="load-local-music"
                type="button"
                onClick={() => void pickFiles()}
                disabled={isLibLoading}
                className="btn-neon"
              >
                {isLibLoading ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : hasTracks ? (
                  <Plus className="h-5 w-5" />
                ) : (
                  <HardDriveDownload className="h-5 w-5" />
                )}
                {hasTracks ? 'Add More Music' : 'Load Local Music Library'}
              </button>
              <button
                id="load-local-folder"
                type="button"
                onClick={() => void pickFolder()}
                disabled={isLibLoading}
                className="btn-glass"
              >
                <FolderOpen className="h-4 w-4" />
                Choose Folder
              </button>
            </div>
          </div>

          {!hasTracks && (
            <div
              className={`relative mt-6 flex items-center justify-center gap-3 rounded-2xl border border-dashed px-4 py-6 text-sm transition-colors ${
                isDragging ? 'border-neon text-neon' : 'border-white/15 text-white/40'
              }`}
            >
              <Upload className={`h-4 w-4 ${isDragging ? 'animate-bounce' : ''}`} />
              {isDragging ? 'Drop to add to your library' : 'or drag & drop audio files here'}
            </div>
          )}

          {(libError || (lastAdded !== null && !isLibLoading)) && (
            <div className="relative mt-5">
              {libError ? (
                <Alert variant="error">{libError}</Alert>
              ) : (
                <Alert variant="success">
                  {lastAdded === 0
                    ? 'Those tracks are already in your library.'
                    : `Added ${lastAdded} track${lastAdded === 1 ? '' : 's'} to your library.`}
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Track list */}
        {hasTracks && (
          <div className="mt-6 animate-fade-in-up">
            <div className="mb-4 flex items-center gap-4 px-1">
              <button
                id="library-play-all"
                type="button"
                onClick={handlePlayAll}
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-neon-gradient text-black transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isPlaying ? 'animate-pulse-glow' : 'shadow-glow hover:shadow-glow-lg'
                }`}
                aria-label={isPlaying ? 'Pause' : 'Play library'}
              >
                {isPlaying ? <Pause className="h-6 w-6" fill="currentColor" /> : <Play className="ml-1 h-6 w-6" fill="currentColor" />}
              </button>
              <button
                id="library-shuffle"
                type="button"
                onClick={toggleShuffle}
                className={`icon-btn h-10 w-10 ${shuffle ? 'icon-btn-active' : ''}`}
                aria-label="Shuffle"
                aria-pressed={shuffle}
              >
                <Shuffle className="h-5 w-5" />
              </button>
              <button
                id="library-clear"
                type="button"
                onClick={clearLibrary}
                className="btn-glass ml-auto px-4 py-2 text-xs hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200 hover:shadow-none"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear library
              </button>
            </div>
            <TrackList />
          </div>
        )}
      </section>

      <PlaylistSection
        id="made-for-you"
        title={`Made for ${user?.username ?? 'you'}`}
        subtitle="Mixes tuned to your taste — synced once your account library is connected."
        items={MADE_FOR_YOU}
        onPlay={handlePlaylistPlay}
      />
      <PlaylistSection
        id="recently-played"
        title="Recently played"
        subtitle="Jump back in where you left off."
        items={RECENTLY_PLAYED}
        onPlay={handlePlaylistPlay}
      />
    </div>
  );
}
