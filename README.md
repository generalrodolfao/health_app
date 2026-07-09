# HealthApp — Monitoramento de Saúde

SaaS de monitoramento de saúde com checkups anuais, compliance NR-1
(saúde mental ocupacional) e mapa de unidades próximas.

## Status do Deploy

**Railway (produção de teste)**: https://healthapp-production-aea8.up.railway.app

- Backend (NestJS + Prisma + SQLite) — operacional
- Frontend (Next.js static export) — servido pelo mesmo container
- API docs (Swagger) — `/api/docs`

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 + React 19 + Tailwind v4 |
| Backend | NestJS 11 + TypeScript |
| Database | SQLite (MVP) → PostgreSQL (produção) |
| ORM | Prisma 6 |
| Mapa | Leaflet + OpenStreetMap |
| Deploy | Railway (atual) → VPS/Railway (futuro) |

## Funcionalidades

- **Checkups Anuais**: exames obrigatórios categorizados (rotina,
  cardiovascular, dental, visão, preventivo, mental)
- **NR-1 Saúde Mental**: questionário psicossocial, dashboard
  corporativo, plano de ação — compliance com Portaria MTE nº
  1.419/2024
- **Mapa da Saúde**: farmácias, hospitais e clínicas próximas com
  Leaflet + OpenStreetMap
- **Modo Emergência**: hospital mais próximo com um clique

## Início Rápido (Local)

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push --accept-data-loss
npm run start:dev    # http://localhost:3333

# Frontend
cd frontend
npm install
npm run dev          # http://localhost:3000
```

## Deploy no Railway

O projeto usa um único `Dockerfile` na raiz que builda backend + frontend
em um container só, com SQLite embutido (sem plugin de PostgreSQL).

1. **New Project → Deploy from GitHub repo** → selecione o repo
2. Railway detecta o `Dockerfile` automaticamente
3. **Zero variáveis de ambiente obrigatórias** (SQLite é arquivo local)
4. Deploy → app live em ~2 min

### Endpoints após deploy

| URL | Descrição |
|-----|-----------|
| `/` | Frontend (dashboard, checkups, mapa, NR-1) |
| `/api/health` | Health check |
| `/api/docs` | Swagger UI |
| `/api/checkups` | CRUD de checkups |
| `/api/facilities/nearby?lat=-23.55&lng=-46.63` | Unidades próximas |
| `/api/nr1/dashboard/:companyId` | Dashboard NR-1 |

### Migrar para PostgreSQL (produção)

Quando precisar de persistência real:

1. Railway → **+ New → Database → PostgreSQL** (cria `DATABASE_URL`)
2. Trocar `provider = "sqlite"` para `"postgresql"` no `schema.prisma`
3. Remover `ENV DATABASE_URL="file:..."` do Dockerfile
4. Adicionar tipos PG-specific de volta no schema (`@db.Uuid`, etc.)
5. Redeploy

## Deploy em VPS (Docker Compose)

```bash
git clone https://github.com/generalrodolfao/health_app.git
cd healthapp
cp infra/.env.example infra/.env
# Editar infra/.env com suas credenciais
docker compose -f infra/docker-compose.prod.yml up -d
```

Traefik faz SSL automático (Let's Encrypt). Ver `infra/` para detalhes.

## Testes

```bash
cd backend
npm test              # 7 testes unitários (checkups, nr1, facilities)
npm run typecheck     # TypeScript sem erros
npm run build         # NestJS build OK
```

## Documentação

- [ADRs](docs/adr/) — Architecture Decision Records (4 decisões)
- [BDD Specs](docs/specs/) — Feature files em Gherkin (4 features)
- [Deploy Troubleshooting](docs/DEPLOY-TROUBLESHOOTING.md) — 17 problemas
  encontrados no primeiro deploy e como evitar
- [Skills](skills/SKILL.md) — Guia de desenvolvimento

## Estrutura do Projeto

```
health_app/
├── Dockerfile              ← Único Dockerfile (backend + frontend)
├── start.sh                ← Script de startup (prisma push + node)
├── railway.json            ← Config Railway
├── backend/
│   ├── src/
│   │   ├── common/         ← Prisma, Health
│   │   └── modules/
│   │       ├── checkups/   ← Checkups anuais
│   │       ├── nr1/        ← NR-1 saúde mental
│   │       └── facilities/ ← Mapa de unidades
│   └── prisma/schema.prisma
├── frontend/
│   └── src/app/            ← Pages: dashboard, checkups, map, nr1
├── docs/
│   ├── adr/                ← 4 ADRs
│   ├── specs/              ← 4 BDD specs
│   └── DEPLOY-TROUBLESHOOTING.md
└── infra/                  ← Docker compose para VPS
```

## Licença

MIT