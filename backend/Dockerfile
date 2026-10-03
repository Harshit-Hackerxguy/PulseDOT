FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer unless package files change)
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Copy source (node_modules, dist and .env are excluded via .dockerignore)
COPY tsconfig.json schema.sql ./
COPY src ./src

ENV NODE_ENV=development
EXPOSE 5000

CMD ["npm", "run", "dev"]
