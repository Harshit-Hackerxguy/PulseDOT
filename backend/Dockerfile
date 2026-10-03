# syntax=docker/dockerfile:1
#
# Multi-stage build.
#   docker build .               → production image (default, last stage)
#   docker build --target dev .  → hot-reload dev image (used by docker-compose.yml)

FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ───────────────────────────── Development ─────────────────────────────
FROM base AS dev
RUN npm ci --no-audit --no-fund
COPY tsconfig.json schema.sql ./
COPY src ./src
ENV NODE_ENV=development
EXPOSE 5000
CMD ["npm", "run", "dev"]

# ──────────────────────────────── Build ────────────────────────────────
FROM base AS build
RUN npm ci --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ────────────────────────────── Production ─────────────────────────────
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=build /app/dist ./dist
# db.ts resolves ../schema.sql relative to dist/
COPY schema.sql ./

# Drop root privileges
USER node

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Run node directly (not via npm) so SIGTERM reaches the app for graceful shutdown.
CMD ["node", "dist/server.js"]
