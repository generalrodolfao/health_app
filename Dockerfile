# Root Dockerfile for Railway deploys (backend service)
# Build context = repo root. Use dockerfilePath: "." or omit it in railway.json
#
# For docker-compose VPS deploys, use backend/Dockerfile (context: ./backend) instead.

# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY backend/package.json backend/package-lock.json ./
RUN npm ci && npm cache clean --force

COPY backend/tsconfig.json backend/nest-cli.json ./
COPY backend/src/ src/
COPY backend/prisma/ prisma/

RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# ---- Production Stage ----
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl wget
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs healthapp

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY backend/package.json ./

ENV NODE_ENV=production
ENV PORT=3333

USER healthapp
EXPOSE 3333

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3333/api/health || exit 1

CMD ["node", "dist/main"]