# ── Self-contained: PostgreSQL + Next.js + Node in one container ──

# ---- Backend Build Stage ----
FROM node:22-alpine AS backend-builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/tsconfig.json backend/nest-cli.json ./
COPY backend/src/ src/
COPY backend/prisma/ prisma/
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# ---- Frontend Build Stage ----
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/tsconfig.json frontend/next.config.ts frontend/postcss.config.mjs ./
COPY frontend/src/ src/
COPY frontend/public/ public/
RUN npm run build

# ---- Runtime: Node + PostgreSQL ----
FROM node:22-alpine AS runner
WORKDIR /app

# Install PostgreSQL + tools
RUN (apk add --no-cache postgresql16 postgresql16-contrib 2>/dev/null || \
     apk add --no-cache postgresql17 postgresql17-contrib 2>/dev/null || \
     apk add --no-cache postgresql postgresql-contrib) \
    && apk add --no-cache openssl wget \
    && mkdir -p /var/run/postgresql /var/lib/postgresql/data \
    && chown -R postgres:postgres /var/run/postgresql /var/lib/postgresql/data \
    && chmod 700 /var/lib/postgresql/data

# Copy backend
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/prisma ./prisma
COPY backend/package.json ./

# Copy frontend static export
COPY --from=frontend-builder /app/out ./public

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

ENV NODE_ENV=production
ENV PORT=3333
ENV PGDATA=/var/lib/postgresql/data
ENV DATABASE_URL="postgresql://healthapp@localhost:5432/healthapp?schema=public"

HEALTHCHECK --interval=10s --timeout=5s --start-period=40s --retries=5 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3333}/api/health || exit 1

CMD ["sh", "/start.sh"]