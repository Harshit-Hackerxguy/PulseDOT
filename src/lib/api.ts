import type { ApiErrorBody } from '../types';

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000/api';

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Attach the Bearer token (default: true) */
  auth?: boolean;
  signal?: AbortSignal;
}

interface ApiConfig {
  getToken: () => string | null;
  onUnauthorized: () => void;
}

/**
 * Dependency-injected hooks so this module never imports the store directly
 * (avoids circular imports: store → service → api → store).
 */
let config: ApiConfig = {
  getToken: () => null,
  onUnauthorized: () => undefined,
};

export function configureApi(next: ApiConfig): void {
  config = next;
}

function extractMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    const b = body as ApiErrorBody;
    const fromArray = b.errors?.[0]?.msg ?? b.errors?.[0]?.message;
    const msg = b.message ?? b.error ?? fromArray;
    if (msg) return msg;
  }
  if (typeof body === 'string' && body.trim().length > 0 && body.length < 200) return body;

  switch (status) {
    case 400:
      return 'Please check the details you entered.';
    case 401:
      return 'Invalid credentials.';
    case 403:
      return 'You do not have permission to do that.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'An account with these details already exists.';
    case 429:
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return status >= 500 ? 'Server error. Please try again later.' : 'Something went wrong.';
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/**
 * Typed fetch wrapper. Throws `ApiError` on non-2xx responses or network failures.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = auth ? config.getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(
      'Unable to reach the server. Make sure the backend is running on port 5000.',
      0,
    );
  }

  const data = await parseBody(res);

  if (!res.ok) {
    // An authenticated request was rejected → session is no longer valid.
    if (res.status === 401 && token) config.onUnauthorized();
    throw new ApiError(extractMessage(data, res.status), res.status, data);
  }

  return data as T;
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong.';
}
