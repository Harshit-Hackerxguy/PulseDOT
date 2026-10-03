import { Play } from 'lucide-react';
import type { Playlist } from '../../types';

interface PlaylistCardProps {
  playlist: Playlist;
  index: number;
  onPlay: (playlist: Playlist) => void;
}

/** Album/playlist tile with generated gradient art and a glowing hover play button. */
export function PlaylistCard({ playlist, index, onPlay }: PlaylistCardProps) {
  return (
    <article
      id={`playlist-${playlist.id}`}
      className="group relative animate-fade-in-up cursor-pointer rounded-2xl border border-transparent p-3 transition-all duration-300 hover:border-white/[0.07] hover:bg-white/[0.05] hover:shadow-glass hover:backdrop-blur-xl"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onPlay(playlist)}
    >
      <div
        className={`relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br ${playlist.gradient} shadow-lg shadow-black/50`}
      >
        {/* Generated cover art: light sweep + concentric rings + title */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
        <div className="absolute -bottom-1/3 -right-1/3 h-full w-full rounded-full border-[18px] border-white/10 transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute -bottom-1/4 -right-1/4 h-2/3 w-2/3 rounded-full border-[10px] border-black/15" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="font-display text-xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg">
            {playlist.title}
          </p>
        </div>

        <button
          id={`playlist-${playlist.id}-play`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(playlist);
          }}
          className="absolute bottom-3 right-3 flex h-12 w-12 translate-y-3 items-center justify-center rounded-full bg-neon-gradient text-black opacity-0 shadow-glow transition-all duration-300 hover:scale-110 hover:shadow-glow-lg group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
          aria-label={`Play ${playlist.title}`}
        >
          <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
        </button>
      </div>
      <h3 className="mt-3 truncate text-sm font-semibold text-white">{playlist.title}</h3>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50">{playlist.description}</p>
    </article>
  );
}
