# 🎵 Pulse.

A full-stack Spotify clone featuring a beautiful, modern, and responsive user interface with a robust backend architecture.

## ✨ Features

- **Modern UI/UX**: Stunning interface inspired by Spotify, built with Tailwind CSS.
- **Responsive Design**: Flawless experience across desktop, tablet, and mobile devices.
- **State Management**: Efficient and predictable global state managed by Zustand.
- **Secure Authentication**: JWT-based authentication with bcrypt for secure password hashing.
- **Robust Backend**: Node.js and Express backend with strict TypeScript, input validation and rate-limited auth endpoints.
- **Database**: PostgreSQL for reliable and relational data storage.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (`pg`)
- **Security**: Helmet, CORS, express-rate-limit, JWT, bcryptjs

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ (or 22.12+)
- PostgreSQL, **or** Docker (the bundled `docker-compose.yml` runs Postgres + the API)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd PulseDOT
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env   # then edit values
   npm run dev
   ```
   Or run Postgres + the API in Docker with hot reload:
   ```bash
   cd backend
   docker compose up --build
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

## ☁️ Deployment (Render + Vercel)

### 1. Backend + database → Render
1. Push this repo to GitHub.
2. Render dashboard → **New → Blueprint** → pick the repo. [`render.yaml`](render.yaml) creates
   the `pulse-api` web service (from `backend/Dockerfile`) and the `pulse-db` Postgres database,
   wires `DATABASE_URL` and generates `JWT_SECRET`.
3. Note the API URL (e.g. `https://pulse-api.onrender.com`) and check `https://…/health` returns `{"status":"ok"}`.

> Using another host (Railway, Fly.io, a VPS)? Build `backend/Dockerfile` and set the env vars from
> [`backend/.env.example`](backend/.env.example). For Neon/Supabase add `DATABASE_SSL=true`.

### 2. Frontend → Vercel
1. Vercel → **Add New Project** → import the repo.
2. Set **Root Directory** to `frontend` (framework: Vite is auto-detected).
3. Add env var `VITE_API_URL` = your Render API URL (no trailing slash). The build fails without it.
4. Deploy. [`frontend/vercel.json`](frontend/vercel.json) handles SPA routing so page refreshes work.

### 3. Connect them
Back in Render, set `CLIENT_URL` on `pulse-api` to your Vercel URL (e.g. `https://pulse.vercel.app`)
and redeploy. Multiple origins can be comma-separated.

### Environment variables

| Where | Variable | Required | Notes |
|---|---|---|---|
| Backend | `DATABASE_URL` | ✅ | Postgres connection string |
| Backend | `JWT_SECRET` | ✅ | ≥ 32 chars in production (`openssl rand -hex 32`) |
| Backend | `CLIENT_URL` | ✅ (prod) | Frontend origin(s) for CORS |
| Backend | `NODE_ENV` | — | `production` enables strict checks |
| Backend | `DATABASE_SSL` | — | `true` / `no-verify` for hosted Postgres needing TLS |
| Backend | `JWT_EXPIRES_IN`, `PORT`, `TRUST_PROXY` | — | Defaults: `7d`, `5000`, `1` in prod |
| Frontend | `VITE_API_URL` | ✅ (build) | Backend origin; baked in at build time |

> [!NOTE]
> Render's free tier sleeps after inactivity (first request takes ~30–60s) and free Postgres
> databases expire after 30 days. Upgrade the plans in `render.yaml` for anything long-lived.

## 📜 License
This project is licensed under the MIT License.
