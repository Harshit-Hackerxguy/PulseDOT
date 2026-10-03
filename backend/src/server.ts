import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { initDb, pool, query } from './db';

dotenv.config();

/* ─────────────────────────────── Config ─────────────────────────────── */

const IS_PROD = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0'; // REQUIRED inside Docker — 127.0.0.1 is unreachable from the host.
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const CLIENT_URLS = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, '')) // browsers send Origin without a trailing slash
  .filter(Boolean);

/**
 * Number of reverse proxies in front of the app (Render, Railway, Fly, Nginx…).
 * Needed so req.ip — and therefore rate limiting — sees the real client IP.
 * Defaults to 1 in production, disabled in development.
 */
const TRUST_PROXY = ((): number | boolean => {
  const raw = process.env.TRUST_PROXY?.trim();
  if (!raw) return IS_PROD ? 1 : false;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : false;
})();

if (!JWT_SECRET) {
  console.error('[config] FATAL: JWT_SECRET is not set.');
  process.exit(1);
}

if (IS_PROD) {
  if (JWT_SECRET.length < 32) {
    console.error('[config] FATAL: JWT_SECRET must be at least 32 characters in production (openssl rand -hex 32).');
    process.exit(1);
  }
  if (!process.env.CLIENT_URL) {
    console.error('[config] FATAL: CLIENT_URL must be set in production (your frontend origin, e.g. https://pulse.vercel.app).');
    process.exit(1);
  }
}

/* ─────────────────────────────── Types ──────────────────────────────── */

interface JwtPayload {
  userId: string;
  email: string;
}

interface AuthedRequest extends Request {
  user?: JwtPayload;
}

interface UserRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

const toPublicUser = (u: Omit<UserRow, 'password_hash'>) => ({
  id: u.id,
  username: u.username,
  email: u.email,
  createdAt: u.created_at,
});

/* ───────────────────────────── Validation ───────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_.]{3,30}$/;
const MIN_PASSWORD = 8;

/** Wraps async handlers so rejected promises reach the error middleware. */
const asyncHandler =
  (fn: (req: AuthedRequest, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req as AuthedRequest, res, next).catch(next);
  };

/* ───────────────────────────── Middleware ───────────────────────────── */

function authenticate(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Missing or malformed Authorization header.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

/* ──────────────────────────────── App ───────────────────────────────── */

const app = express();

app.set('trust proxy', TRUST_PROXY);
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_URLS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '100kb' }));

// Tiny request logger — useful when debugging through `docker compose logs -f api`.
// Health checks are skipped so platform probes don't flood the logs.
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

/** Brute-force protection for credential endpoints: 20 attempts / 15 min / IP. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

/* ─────────────────────────────── Routes ─────────────────────────────── */

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post(
  '/api/auth/signup',
  authLimiter,
  asyncHandler(async (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    const errors: Array<{ field: string; message: string }> = [];
    if (!USERNAME_RE.test(username)) {
      errors.push({
        field: 'username',
        message: 'Username must be 3–30 characters: letters, numbers, underscores or dots.',
      });
    }
    if (!EMAIL_RE.test(email) || email.length > 255) {
      errors.push({ field: 'email', message: 'Please provide a valid email address.' });
    }
    if (password.length < MIN_PASSWORD) {
      errors.push({ field: 'password', message: `Password must be at least ${MIN_PASSWORD} characters.` });
    }
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0].message, errors });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    try {
      const { rows } = await query<UserRow>(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, username, email, created_at`,
        [username, email, passwordHash],
      );
      return res.status(201).json({ message: 'Account created successfully.', user: toPublicUser(rows[0]) });
    } catch (err) {
      // 23505 = unique_violation
      if ((err as { code?: string }).code === '23505') {
        const constraint = (err as { constraint?: string }).constraint || '';
        const field = constraint.includes('email') ? 'email' : 'username';
        return res.status(409).json({
          message: field === 'email' ? 'An account with this email already exists.' : 'This username is already taken.',
          errors: [{ field, message: `${field} already in use` }],
        });
      }
      throw err;
    }
  }),
);

app.post(
  '/api/auth/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const { rows } = await query<UserRow>(
      'SELECT id, username, email, password_hash, created_at FROM users WHERE email = $1',
      [email],
    );
    const user = rows[0];

    // Same message for unknown email and wrong password (prevents user enumeration).
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const payload: JwtPayload = { userId: user.id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET as string, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    return res.status(200).json({ token, user: toPublicUser(user) });
  }),
);

app.get(
  '/api/auth/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const { rows } = await query<UserRow>(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [req.user!.userId],
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ user: toPublicUser(rows[0]) });
  }),
);

/* ─────────────────────────── 404 + error handler ────────────────────── */

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found.` });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'Request body is not valid JSON.' });
    return;
  }
  console.error('[error]', err);
  res.status(err.status || 500).json({
    message: IS_PROD ? 'Internal server error.' : err.message,
  });
});

/* ─────────────────────────────── Startup ────────────────────────────── */

process.on('unhandledRejection', (reason) => console.error('[process] Unhandled rejection:', reason));
process.on('uncaughtException', (err) => {
  console.error('[process] Uncaught exception:', err);
  process.exit(1);
});

async function start(): Promise<void> {
  try {
    await initDb();
  } catch (err) {
    console.error('[startup] Could not initialise the database. Exiting.', err);
    process.exit(1);
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 API listening on http://${HOST}:${PORT} (CORS: ${CLIENT_URLS.join(', ')})`);
  });

  const shutdown = (signal: string) => {
    console.log(`[shutdown] ${signal} received, closing server…`);
    server.close(() => {
      pool.end().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

void start();
