#!/usr/bin/env bash
# HealthApp - VPS Deploy Script
# Usage: ./infra/deploy-vps.sh
#
# Requires: docker, docker compose, envsubst (gettext), openssl

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "✗ Arquivo .env não encontrado em ${ENV_FILE}"
  echo "  Copie infra/.env.example para infra/.env e preencha os valores."
  exit 1
fi

# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

# Validate required vars
for var in DB_USER DB_PASSWORD DB_NAME JWT_SECRET DOMAIN LETSENCRYPT_EMAIL; do
  if [[ -z "${!var:-}" ]]; then
    echo "✗ Variável $var não definida em .env"
    exit 1
  fi
done

# Generate strong JWT if user kept the placeholder
if [[ "$JWT_SECRET" == *"generate-one"* ]]; then
  echo "→ Gerando JWT_SECRET seguro com openssl..."
  JWT_SECRET="$(openssl rand -hex 32)"
  sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" "$ENV_FILE" && rm -f "${ENV_FILE}.bak"
fi

# Ensure acme.json has correct permissions for Let's Encrypt
ACME_FILE="${SCRIPT_DIR}/acme.json"
touch "$ACME_FILE"
chmod 600 "$ACME_FILE"

echo "✓ Variáveis validadas"
echo "  DOMAIN: ${DOMAIN}"
echo "  DB_NAME: ${DB_NAME}"
echo "  EMAIL: ${LETSENCRYPT_EMAIL}"
echo ""

# Pull latest images (if using GCR) or build locally
if [[ -n "${BUILD_LOCALLY:-1}" ]]; then
  echo "→ Construindo imagens localmente (mode build)..."
  docker compose -f "${SCRIPT_DIR}/docker-compose.prod.yml" build --no-cache
else
  echo "→ Baixando imagens..."
  docker compose -f "${SCRIPT_DIR}/docker-compose.prod.yml" pull
fi

# Stop existing containers, start fresh
echo "→ Reiniciando containers..."
docker compose -f "${SCRIPT_DIR}/docker-compose.prod.yml" down --remove-orphans
docker compose -f "${SCRIPT_DIR}/docker-compose.prod.yml" up -d

# Wait for healthchecks
echo "→ Aguardando healthchecks (até 60s)..."
for i in $(seq 1 12); do
  STATUS=$(docker compose -f "${SCRIPT_DIR}/docker-compose.prod.yml" ps --format json 2>/dev/null | jq -r '.Health' 2>/dev/null || echo "unknown")
  if [[ "$STATUS" == "healthy" ]]; then break; fi
  sleep 5
done

echo ""
echo "✓ Deploy concluído!"
echo "  Frontend: https://${DOMAIN}"
echo "  API:      https://api.${DOMAIN}"
echo "  Swagger:  https://api.${DOMAIN}/api/docs"
echo ""

# Prune dangling images
docker image prune -f 2>/dev/null || true

# Show running containers
docker compose -f "${SCRIPT_DIR}/docker-compose.prod.yml" ps