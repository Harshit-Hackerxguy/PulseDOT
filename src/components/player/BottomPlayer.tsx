import {
  Heart,
  ListMusic,
  Music2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties } from 'react';
import { useCurrentTrack, usePlayerStore } from '../../store/usePlayerStore';
import { gradientFor } from '../../utils/covers';
import { formatTime } from '../../utils/format';

function progressStyle(value: number, max: number): CSSProperties {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return { '--progress': `${pct}%` } as CSSProperties;
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

/**
 * Persistent bottom transport bar. Owns the single hidden <audio> element and
 * wires its events into the global player store.
 */
export function BottomPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isScrubbing = useRef(false);
  const [scrubTime, setScrubTime] = useState<number | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const track = useCurrentTrack();
  const tracks = usePlayerStore((s) => s.tracks);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);

  const {
    registerAudio,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    syncTime,
    syncDuration,
    syncPlaying,
  } = usePlayerStore.getState();

  const hasQueue = tracks.length > 0;
  const shownTime = scrubTime ?? currentTime;
  const effectiveVolume = isMuted ? 0 : volume;

  /* Register the <audio> element with the store for imperative control. */
  useEffect(() => {
    registerAudio(audioRef.current);
    return () => registerAudio(null);
  }, [registerAudio]);

  /* Space = play/pause, Shift+←/→ = prev/next (ignored while typing). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.shiftKey && e.code === 'ArrowRight') next();
      else if (e.shiftKey && e.code === 'ArrowLeft') previous();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, next, previous]);

  /* OS-level media controls (lock screen, hardware keys). */
  useEffect(() => {
    if (!('mediaSession' in navigator) || !track) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: 'Local Library',
    });
    const handlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      ['play', () => togglePlay()],
      ['pause', () => togglePlay()],
      ['nexttrack', () => next()],
      ['previoustrack', () => previous()],
      ['seekto', (d) => d.seekTime != null && seek(d.seekTime)],
    ];
    handlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        /* unsupported action */
      }
    });
  }, [track, togglePlay, next, previous, seek]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  /* Seek bar: scrub locally while dragging, commit on release. */
  const handleSeekChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (isScrubbing.current) setScrubTime(value);
    else seek(value); // keyboard / click
  };
  const commitScrub = () => {
    if (scrubTime != null) seek(scrubTime);
    isScrubbing.current = false;
    setScrubTime(null);
  };

  const VolumeIcon =
    effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.34 ? Volume : effectiveVolume < 0.67 ? Volume1 : Volume2;
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;
  const isLiked = track ? Boolean(liked[track.id]) : false;

  return (
    <footer
      id="bottom-player"
      className="relative z-30 shrink-0 border-t border-neon/15 bg-black/70 px-3 py-3 backdrop-blur-2xl sm:px-4"
    >
      {/* Neon hairline + glow across the top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-neon/70 to-transparent"
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-1/4 -top-6 h-6 rounded-full bg-neon/20 blur-2xl transition-opacity duration-700 ${
          isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={(e) => !isScrubbing.current && syncTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => syncDuration(e.currentTarget.duration)}
        onDurationChange={(e) => syncDuration(e.currentTarget.duration)}
        onPlay={() => syncPlaying(true)}
        onPause={() => syncPlaying(false)}
        onEnded={() => next(true)}
        onError={() => syncPlaying(false)}
        hidden
      />

      <div className="grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]">
        {/* ── Now playing ── */}
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br shadow-lg ${
              track ? gradientFor(track.id) : 'from-base-600 to-base-800'
            } ${isPlaying ? 'shadow-glow-sm' : ''}`}
          >
            <Music2 className={`h-6 w-6 text-white/80 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          <div className="min-w-0">
            <p
              id="player-track-title"
              className={`truncate text-sm font-semibold ${track ? 'text-white' : 'text-white/40'}`}
              title={track?.title}
            >
              {track?.title ?? 'Nothing playing'}
            </p>
            <p className="truncate text-xs text-white/50">
              {track?.artist ?? (hasQueue ? 'Pick a track to start' : 'Load local music to begin')}
            </p>
          </div>
          {track && (
            <button
              id="player-like"
              type="button"
              onClick={() => setLiked((l) => ({ ...l, [track.id]: !l[track.id] }))}
              className={`icon-btn ml-1 hidden h-8 w-8 shrink-0 sm:inline-flex ${isLiked ? 'icon-btn-active' : ''}`}
              aria-label={isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
              aria-pressed={isLiked}
            >
              <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {/* ── Transport ── */}
        <div className="flex flex-col items-center gap-1.5 md:px-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              id="player-shuffle"
              type="button"
              onClick={toggleShuffle}
              disabled={!hasQueue}
              className={`icon-btn hidden h-8 w-8 sm:inline-flex ${shuffle ? 'icon-btn-active' : ''}`}
              aria-label="Shuffle"
              aria-pressed={shuffle}
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              id="player-previous"
              type="button"
              onClick={previous}
              disabled={!hasQueue}
              className="icon-btn h-9 w-9"
              aria-label="Previous track"
            >
              <SkipBack className="h-5 w-5" fill="currentColor" />
            </button>
            <button
              id="player-play-pause"
              type="button"
              onClick={togglePlay}
              disabled={!hasQueue}
              className={`flex h-11 w-11 items-center justify-center rounded-full bg-neon-gradient text-black transition-all duration-300 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:bg-none disabled:bg-white/20 disabled:text-black/50 disabled:shadow-none disabled:hover:scale-100 ${
                isPlaying ? 'animate-pulse-glow' : 'shadow-glow-sm hover:shadow-glow'
              }`}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" fill="currentColor" />
              ) : (
                <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
              )}
            </button>
            <button
              id="player-next"
              type="button"
              onClick={() => next()}
              disabled={!hasQueue}
              className="icon-btn h-9 w-9"
              aria-label="Next track"
            >
              <SkipForward className="h-5 w-5" fill="currentColor" />
            </button>
            <button
              id="player-repeat"
              type="button"
              onClick={cycleRepeat}
              disabled={!hasQueue}
              className={`icon-btn hidden h-8 w-8 sm:inline-flex ${repeat !== 'off' ? 'icon-btn-active' : ''}`}
              aria-label={`Repeat: ${repeat}`}
            >
              <RepeatIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="group hidden w-full max-w-xl items-center gap-2 md:flex">
            <span className="w-10 text-right text-[11px] tabular-nums text-white/50">{formatTime(shownTime)}</span>
            <input
              id="player-seek"
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(shownTime, duration || 0)}
              onChange={handleSeekChange}
              onPointerDown={() => {
                isScrubbing.current = true;
              }}
              onPointerUp={commitScrub}
              onBlur={() => isScrubbing.current && commitScrub()}
              disabled={!track || !duration}
              className="range"
              style={progressStyle(shownTime, duration)}
              aria-label="Seek"
              aria-valuetext={`${formatTime(shownTime)} of ${formatTime(duration)}`}
            />
            <span className="w-10 text-[11px] tabular-nums text-white/50">{formatTime(duration)}</span>
          </div>
        </div>

        {/* ── Volume / queue ── */}
        <div className="hidden items-center justify-end gap-3 md:flex">
          <div
            className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-xs text-white/50"
            title="Tracks in queue"
          >
            <ListMusic className="h-3.5 w-3.5" />
            <span className="tabular-nums">{tracks.length}</span>
          </div>
          <div className="group flex w-36 items-center gap-2">
            <button
              id="player-mute"
              type="button"
              onClick={toggleMute}
              className="icon-btn h-8 w-8 shrink-0"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon className="h-4 w-4" />
            </button>
            <input
              id="player-volume"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={effectiveVolume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="range"
              style={progressStyle(effectiveVolume, 1)}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      {/* Mobile progress strip */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10 md:hidden">
        <div
          className="h-full bg-neon shadow-glow-xs transition-[width] duration-200"
          style={{ width: `${duration ? (shownTime / duration) * 100 : 0}%` }}
        />
      </div>
    </footer>
  );
}
