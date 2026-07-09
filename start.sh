#!/bin/sh
set -e
cd /app
echo "[start] Creating SQLite database + schema..."
npx prisma db push --accept-data-loss 2>&1 | tail -3
echo "[start] Starting API on port ${PORT:-3333}..."
exec node dist/main