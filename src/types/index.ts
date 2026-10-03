/* ─────────────────────────── Auth / API ─────────────────────────── */

export interface User {
  id: string | number;
  username: string;
  email: string;
  createdAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

/** Expected response from POST /api/auth/login */
export interface AuthResponse {
  token: string;
  user: User;
}

/** Expected response from POST /api/auth/signup (shape is flexible on the backend) */
export interface SignupResponse {
  message?: string;
  user?: User;
}

/** Common error body shapes produced by Express APIs */
export interface ApiErrorBody {
  message?: string;
  error?: string;
  errors?: Array<{ msg?: string; message?: string }>;
}

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

/* ───────────────────────────── Player ───────────────────────────── */

export interface Track {
  id: string;
  title: string;
  artist: string;
  fileName: string;
  /** Object URL created from the local File (blob:...) */
  url: string;
  size: number;
  mimeType: string;
  /** Seconds. Resolved asynchronously from file metadata. */
  duration: number | null;
}

export type RepeatMode = 'off' | 'all' | 'one';

/* ───────────────────────────── UI data ──────────────────────────── */

export interface Playlist {
  id: string;
  title: string;
  description: string;
  /** Tailwind gradient classes used to render generated cover art */
  gradient: string;
}
