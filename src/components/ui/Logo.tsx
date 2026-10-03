interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

const SIZES = {
  sm: { box: 'h-8 w-8', bar: 'w-[3px]', text: 'text-lg' },
  md: { box: 'h-10 w-10', bar: 'w-1', text: 'text-2xl' },
  lg: { box: 'h-14 w-14', bar: 'w-1.5', text: 'text-3xl' },
} as const;

const BAR_HEIGHTS = ['h-[35%]', 'h-[70%]', 'h-full', 'h-[55%]'];

/** Animated equalizer logo mark with a neon glow. */
export function Logo({ size = 'md', showWordmark = true }: LogoProps) {
  const s = SIZES[size];
  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className={`${s.box} relative flex items-center justify-center rounded-full border border-neon/40 bg-black shadow-glow-sm`}
      >
        <div className="flex h-1/2 items-end gap-[3px]">
          {BAR_HEIGHTS.map((h, i) => (
            <span
              key={h}
              className={`${s.bar} ${h} origin-bottom animate-equalizer rounded-full bg-neon-gradient`}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
      {showWordmark && (
        <span className={`${s.text} font-display font-bold tracking-tight text-white`}>
          Pulse<span className="text-neon text-glow">.</span>
        </span>
      )}
    </div>
  );
}
