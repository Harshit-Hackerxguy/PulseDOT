import { Clock3, Music2, Pause, Play } from 'lucide-react';
import { useCurrentTrack, usePlayerStore } from '../../store/usePlayerStore';
import { gradientFor } from '../../utils/covers';
import { formatBytes, formatTime } from '../../utils/format';
import { Equalizer } from '../ui/Equalizer';

/** Playable list of local tracks bound to the global player store. */
export function TrackList() {
  const tracks = usePlayerStore((s) => s.tracks);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const current = useCurrentTrack();

  const handleRowAction = (index: number) => {
    if (index === currentIndex) togglePlay();
    else playTrack(index);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20 backdrop-blur-xl" role="table" aria-label="Local tracks">
      {/* Header */}
      <div
        role="row"
        className="grid grid-cols-[2.5rem_minmax(0,1fr)_4rem] items-center gap-4 border-b border-white/[0.06] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/40 md:grid-cols-[2.5rem_minmax(0,2fr)_minmax(0,1fr)_5rem_4rem]"
      >
        <span role="columnheader" className="text-center">#</span>
        <span role="columnheader">Title</span>
        <span role="columnheader" className="hidden md:block">File</span>
        <span role="columnheader" className="hidden text-right md:block">Size</span>
        <span role="columnheader" className="flex justify-end">
          <Clock3 className="h-3.5 w-3.5" aria-label="Duration" />
        </span>
      </div>

      <ul role="rowgroup" className="divide-y divide-white/[0.03]">
        {tracks.map((track, i) => {
          const isCurrent = current?.id === track.id;
          const isActive = isCurrent && isPlaying;
          return (
            <li
              key={track.id}
              id={`track-row-${i}`}
              role="row"
              tabIndex={0}
              onDoubleClick={() => playTrack(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRowAction(i);
                }
              }}
              className={`group grid cursor-default grid-cols-[2.5rem_minmax(0,1fr)_4rem] items-center gap-4 px-4 py-2.5 transition-all duration-200 md:grid-cols-[2.5rem_minmax(0,2fr)_minmax(0,1fr)_5rem_4rem] ${
                isCurrent
                  ? 'bg-neon/[0.08] shadow-glow-inset'
                  : 'hover:bg-white/[0.05]'
              }`}
            >
              {/* Index / play toggle */}
              <div role="cell" className="relative flex h-8 items-center justify-center">
                <span className={`text-sm tabular-nums text-white/40 group-hover:opacity-0 ${isCurrent ? 'opacity-0' : ''}`}>
                  {i + 1}
                </span>
                {isCurrent && (
                  <span className="absolute group-hover:opacity-0">
                    <Equalizer playing={isActive} />
                  </span>
                )}
                <button
                  id={`track-${i}-play`}
                  type="button"
                  onClick={() => handleRowAction(i)}
                  className="absolute inset-0 flex items-center justify-center text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label={isActive ? `Pause ${track.title}` : `Play ${track.title}`}
                >
                  {isActive ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4" fill="currentColor" />}
                </button>
              </div>

              {/* Title + artist */}
              <div role="cell" className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${gradientFor(track.id)} ${
                    isActive ? 'shadow-glow-sm' : ''
                  }`}
                >
                  <Music2 className="h-4 w-4 text-white/80" />
                </div>
                <div className="min-w-0">
                  <p className={`truncate text-sm font-medium ${isCurrent ? 'text-neon text-glow' : 'text-white'}`} title={track.title}>
                    {track.title}
                  </p>
                  <p className="truncate text-xs text-white/50">{track.artist}</p>
                </div>
              </div>

              <span role="cell" className="hidden truncate text-xs text-white/40 md:block" title={track.fileName}>
                {track.fileName}
              </span>
              <span role="cell" className="hidden text-right text-xs tabular-nums text-white/40 md:block">
                {formatBytes(track.size)}
              </span>
              <span role="cell" className="text-right text-xs tabular-nums text-white/50">
                {track.duration == null ? (
                  <span className="inline-block h-3 w-8 animate-shimmer rounded bg-gradient-to-r from-white/5 via-white/15 to-white/5 bg-[length:200%_100%]" />
                ) : (
                  formatTime(track.duration)
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
