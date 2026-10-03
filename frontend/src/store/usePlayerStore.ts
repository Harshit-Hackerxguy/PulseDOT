import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { RepeatMode, Track } from '../types';

interface PlayerState {
  /** The single hidden <audio> element rendered by <BottomPlayer />. */
  audio: HTMLAudioElement | null;

  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;

  /* Library management */
  registerAudio: (el: HTMLAudioElement | null) => void;
  addTracks: (tracks: Track[]) => number;
  setTrackDuration: (id: string, duration: number | null) => void;
  clearLibrary: () => void;

  /* Transport controls */
  playTrack: (index: number) => void;
  togglePlay: () => void;
  next: (auto?: boolean) => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;

  /* Sync from <audio> events (single source of truth = the element) */
  syncTime: (time: number) => void;
  syncDuration: (duration: number) => void;
  syncPlaying: (playing: boolean) => void;
}

function safePlay(audio: HTMLAudioElement): void {
  audio.play().catch((err: unknown) => {
    // AbortError fires when src changes mid-load (fast skipping) — harmless.
    if (!(err instanceof DOMException && err.name === 'AbortError')) {
      console.warn('[player] playback failed:', err);
    }
  });
}

function randomIndex(length: number, exclude: number): number {
  if (length <= 1) return 0;
  let i = exclude;
  while (i === exclude) i = Math.floor(Math.random() * length);
  return i;
}

const REPEAT_CYCLE: Record<RepeatMode, RepeatMode> = { off: 'all', all: 'one', one: 'off' };

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      audio: null,
      tracks: [],
      currentIndex: -1,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      shuffle: false,
      repeat: 'off',

      registerAudio: (el) => {
        if (el) {
          el.volume = get().volume;
          el.muted = get().isMuted;
        }
        set({ audio: el });
      },

      addTracks: (incoming) => {
        const existing = new Set(get().tracks.map((t) => t.id));
        const fresh: Track[] = [];
        for (const t of incoming) {
          if (existing.has(t.id)) URL.revokeObjectURL(t.url);
          else {
            existing.add(t.id);
            fresh.push(t);
          }
        }
        if (fresh.length) set((s) => ({ tracks: [...s.tracks, ...fresh] }));
        return fresh.length;
      },

      setTrackDuration: (id, duration) =>
        set((s) => ({
          tracks: s.tracks.map((t) => (t.id === id ? { ...t, duration } : t)),
        })),

      clearLibrary: () => {
        const { audio, tracks } = get();
        if (audio) {
          audio.pause();
          audio.removeAttribute('src');
          audio.load();
        }
        tracks.forEach((t) => URL.revokeObjectURL(t.url));
        set({ tracks: [], currentIndex: -1, isPlaying: false, currentTime: 0, duration: 0 });
      },

      playTrack: (index) => {
        const { audio, tracks } = get();
        const track = tracks[index];
        if (!audio || !track) return;

        set({ currentIndex: index, currentTime: 0, duration: track.duration ?? 0 });
        if (audio.src !== track.url) audio.src = track.url;
        else audio.currentTime = 0;
        safePlay(audio);
      },

      togglePlay: () => {
        const { audio, currentIndex, tracks, playTrack } = get();
        if (!audio || tracks.length === 0) return;
        if (currentIndex === -1) return playTrack(0);
        if (audio.paused) safePlay(audio);
        else audio.pause();
      },

      next: (auto = false) => {
        const { audio, tracks, currentIndex, shuffle, repeat, playTrack } = get();
        if (!audio || tracks.length === 0) return;

        if (auto && repeat === 'one') {
          audio.currentTime = 0;
          return safePlay(audio);
        }
        if (shuffle) return playTrack(randomIndex(tracks.length, currentIndex));

        const nextIndex = currentIndex + 1;
        if (nextIndex < tracks.length) return playTrack(nextIndex);

        // End of queue
        if (repeat === 'all' || !auto) return playTrack(0);
        audio.pause();
        audio.currentTime = 0;
        set({ currentTime: 0 });
      },

      previous: () => {
        const { audio, tracks, currentIndex, repeat, playTrack } = get();
        if (!audio || tracks.length === 0) return;

        // Spotify behaviour: restart the current song if more than 3s in.
        if (audio.currentTime > 3 || currentIndex === -1) {
          if (currentIndex === -1) return playTrack(0);
          audio.currentTime = 0;
          return;
        }
        const prevIndex =
          currentIndex - 1 >= 0 ? currentIndex - 1 : repeat === 'all' ? tracks.length - 1 : 0;
        playTrack(prevIndex);
      },

      seek: (time) => {
        const { audio, duration } = get();
        if (!audio || !Number.isFinite(time)) return;
        const clamped = Math.max(0, Math.min(time, duration || audio.duration || 0));
        audio.currentTime = clamped;
        set({ currentTime: clamped });
      },

      setVolume: (volume) => {
        const v = Math.max(0, Math.min(1, volume));
        const { audio } = get();
        if (audio) {
          audio.volume = v;
          audio.muted = v === 0;
        }
        set({ volume: v, isMuted: v === 0 });
      },

      toggleMute: () => {
        const { audio, isMuted, volume } = get();
        const nextMuted = !isMuted;
        // Unmuting at 0 volume should restore an audible level.
        const nextVolume = !nextMuted && volume === 0 ? 0.5 : volume;
        if (audio) {
          audio.muted = nextMuted;
          audio.volume = nextVolume;
        }
        set({ isMuted: nextMuted, volume: nextVolume });
      },

      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
      cycleRepeat: () => set((s) => ({ repeat: REPEAT_CYCLE[s.repeat] })),

      syncTime: (time) => set({ currentTime: time }),
      syncDuration: (duration) => {
        if (!Number.isFinite(duration)) return;
        const { tracks, currentIndex } = get();
        const current = tracks[currentIndex];
        set({ duration });
        if (current && current.duration == null) get().setTrackDuration(current.id, duration);
      },
      syncPlaying: (playing) => set({ isPlaying: playing }),
    }),
    {
      name: 'pulse-player-prefs',
      storage: createJSONStorage(() => localStorage),
      // Blob URLs die with the page, so only user preferences are persisted.
      partialize: (s) => ({ volume: s.volume, isMuted: s.isMuted, shuffle: s.shuffle, repeat: s.repeat }),
    },
  ),
);

/** Convenience selector for the active track. */
export const useCurrentTrack = (): Track | null =>
  usePlayerStore((s) => s.tracks[s.currentIndex] ?? null);
