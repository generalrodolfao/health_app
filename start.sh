#!/bin/sh
set -e

PGPORT=5432
PGUSER=healthapp
PGDATABASE=healthapp
PGDATA=${PGDATA:-/var/lib/postgresql/data}

cd /app

# ── 1. Init PostgreSQL on first run ──
if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "[start] Initializing PostgreSQL..."
  mkdir -p "$PGDATA"
  chown postgres:postgres "$PGDATA"
  chmod 700 "$PGDATA"
  su postgres -c "initdb -D \"$PGDATA\" --auth=trust -U $PGUSER >/dev/null 2>&1"
fi

# ── 2. Start PostgreSQL ──
echo "[start] Starting PostgreSQL..."
su postgres -c "pg_ctl -D \"$PGDATA\" -o \"-c listen_addresses='localhost' -c port=$PGPORT\" -w start"

# ── 3. Create database ──
echo "[start] Ensuring database $PGDATABASE..."
su postgres -c "psql -p $PGPORT -tAc \"SELECT 1 FROM pg_database WHERE datname='$PGDATABASE'\"" | grep -q 1 \
  || su postgres -c "createdb -p $PGPORT -U $PGUSER $PGDATABASE"

# ── 4. Push Prisma schema ──
echo "[start] Pushing Prisma schema..."
export DATABASE_URL="postgresql://$PGUSER@localhost:$PGPORT/$PGDATABASE?schema=public"
npx prisma db push --accept-data-loss 2>&1 | tail -3

# ── 5. Seed demo data (idempotent) ──
echo "[start] Seeding demo data..."
npx prisma db seed 2>&1 | tail -3 || echo "[start] seed skipped"

# ── 6. Start Node app ──
echo "[start] Starting API on port ${PORT:-3333}..."
exec node dist/main