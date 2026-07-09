#!/bin/sh
set -e

PGPORT=${PGPORT:-5432}
PGUSER=${PGUSER:-healthapp}
PGDATABASE=${PGDATABASE:-healthapp}

echo "[startup] PGDATA=$PGDATA PGPORT=$PGPORT DB=$PGDATABASE"

# ── 1. Init postgres data dir on first run ──
if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "[startup] Initializing PostgreSQL data directory..."
  mkdir -p "$PGDATA"
  chown -R postgres:postgres "$PGDATA"
  chmod 700 "$PGDATA"
  su postgres -c "initdb -D \"$PGDATA\" --auth=trust -U $PGUSER >/dev/null 2>&1"
fi

# ── 2. Start postgres on localhost ──
echo "[startup] Starting PostgreSQL..."
su postgres -c "pg_ctl -D \"$PGDATA\" -o \"-c listen_addresses='localhost' -c port=$PGPORT\" -w start"

# ── 3. Create database (idempotent) ──
echo "[startup] Ensuring database $PGDATABASE..."
su postgres -c "psql -p $PGPORT -tAc \"SELECT 1 FROM pg_database WHERE datname='$PGDATABASE'\"" | grep -q 1 \
  || su postgres -c "createdb -p $PGPORT -U $PGUSER $PGDATABASE"
echo "[startup] Database ready."

# ── 4. Apply Prisma schema (best-effort) ──
echo "[startup] Pushing Prisma schema..."
cd /app
npx prisma db push --accept-data-loss 2>&1 | tail -3 || echo "[startup] prisma db push skipped"

# ── 5. Start Node app (foreground, replaces shell) ──
echo "[startup] Starting Node app on port ${PORT:-3333}..."
exec node dist/main