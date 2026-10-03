import type { Playlist } from '../types';

/**
 * Placeholder catalogue shown until the backend exposes playlist endpoints.
 * Replace with an API call (e.g. GET /api/playlists) once available.
 */
export const MADE_FOR_YOU: Playlist[] = [
  { id: 'mix-1', title: 'Neon Nights', description: 'Synthwave & retro electronica for after dark.', gradient: 'from-neon-400 via-emerald-600 to-teal-950' },
  { id: 'mix-2', title: 'Deep Focus', description: 'Ambient textures to keep you in the zone.', gradient: 'from-sky-400 via-blue-700 to-slate-950' },
  { id: 'mix-3', title: 'Golden Hour', description: 'Warm indie and soul for sunset drives.', gradient: 'from-amber-400 via-orange-600 to-rose-950' },
  { id: 'mix-4', title: 'Pulse Daily', description: 'Your daily dose of fresh energy.', gradient: 'from-fuchsia-500 via-purple-700 to-indigo-950' },
  { id: 'mix-5', title: 'Lo-Fi Glass', description: 'Chill beats, frosted and smooth.', gradient: 'from-cyan-300 via-teal-600 to-emerald-950' },
  { id: 'mix-6', title: 'Velvet Club', description: 'House grooves with a late-night shimmer.', gradient: 'from-rose-400 via-pink-700 to-purple-950' },
];

export const RECENTLY_PLAYED: Playlist[] = [
  { id: 'rp-1', title: 'Liked Songs', description: 'Every track you love, in one place.', gradient: 'from-violet-500 via-indigo-700 to-black' },
  { id: 'rp-2', title: 'Night Run', description: 'High-BPM fuel for midnight miles.', gradient: 'from-lime-300 via-neon-600 to-emerald-950' },
  { id: 'rp-3', title: 'Acoustic Rain', description: 'Unplugged and intimate.', gradient: 'from-slate-300 via-slate-600 to-black' },
  { id: 'rp-4', title: 'Bass Garden', description: 'Heavy low-end, lush highs.', gradient: 'from-emerald-300 via-green-700 to-black' },
  { id: 'rp-5', title: 'Morning Glow', description: 'Soft starts for slow mornings.', gradient: 'from-yellow-300 via-amber-600 to-orange-950' },
  { id: 'rp-6', title: 'Cyber Drift', description: 'Glitchy, glossy, futuristic.', gradient: 'from-cyan-400 via-fuchsia-600 to-indigo-950' },
];
