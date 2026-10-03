/** Curated gradient palettes for generated cover art (no image assets needed). */
export const COVER_GRADIENTS = [
  'from-neon-400 via-emerald-600 to-teal-900',
  'from-fuchsia-500 via-purple-700 to-indigo-950',
  'from-amber-400 via-orange-600 to-rose-900',
  'from-sky-400 via-blue-700 to-slate-950',
  'from-rose-400 via-pink-700 to-purple-950',
  'from-lime-300 via-neon-600 to-emerald-950',
  'from-cyan-300 via-teal-600 to-emerald-950',
  'from-violet-400 via-indigo-700 to-black',
] as const;

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Deterministic gradient for a given seed (e.g. track id). */
export function gradientFor(seed: string): string {
  return COVER_GRADIENTS[hash(seed) % COVER_GRADIENTS.length] ?? COVER_GRADIENTS[0];
}
