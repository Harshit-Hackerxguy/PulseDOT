interface EqualizerProps {
  playing?: boolean;
  className?: string;
}

/** Tiny animated bars used to mark the currently playing track. */
export function Equalizer({ playing = true, className = '' }: EqualizerProps) {
  return (
    <span className={`inline-flex h-3.5 items-end gap-[2px] ${className}`} aria-label="Now playing">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-[3px] origin-bottom rounded-full bg-neon shadow-glow-xs ${playing ? 'animate-equalizer' : ''}`}
          style={{ height: '100%', animationDelay: `${i * 0.18}s`, transform: playing ? undefined : 'scaleY(0.35)' }}
        />
      ))}
    </span>
  );
}
