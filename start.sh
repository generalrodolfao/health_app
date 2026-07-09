#!/bin/sh
set -e
cd /app
echo "[start] Pushing Prisma schema to SQLite..."
npx prisma db push --accept-data-loss 2>&1 | tail -3 || echo "[start] db push skipped"
echo "[start] Starting Node app on port ${PORT:-3333}..."
exec node dist/main