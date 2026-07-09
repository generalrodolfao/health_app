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

FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/tsconfig.json frontend/next.config.ts frontend/postcss.config.mjs ./
COPY frontend/src/ src/
COPY frontend/public/ public/
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl wget
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/prisma ./prisma
COPY backend/package.json ./
COPY --from=frontend-builder /app/out ./public
COPY start.sh /start.sh
RUN chmod +x /start.sh
ENV NODE_ENV=production
ENV PORT=3333
ENV DATABASE_URL="file:/app/data.db"
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3333}/api/health || exit 1
CMD ["sh", "/start.sh"]