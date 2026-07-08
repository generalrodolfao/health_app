# HealthApp - Monitoramento de Saúde

SaaS de monitoramento de saúde com checkups anuais, compliance NR-1 (saúde mental) e mapa de unidades próximas.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 + React 19 + Tailwind v4 |
| Backend | NestJS 11 + TypeScript |
| Database | PostgreSQL 16 + PostGIS |
| ORM | Prisma 6 |
| Map | Leaflet + OpenStreetMap |
| Deploy | Docker / VPS / Railway |

## Funcionalidades

- **Checkups Anuais**: Acompanhamento de exames obrigatórios por ano (clínico geral, dentista, cardiologista, etc.)
- **NR-1 Saúde Mental**: Compliance com a nova lei brasileira de riscos psicossociais (Portaria MTE nº 1.419/2024)
- **Mapa da Saúde**: Farmácias, hospitais e clínicas próximas com Leaflet + OpenStreetMap
- **Modo Emergência**: Hospital mais próximo com um clique

## Início Rápido

```bash
# Clone
git clone https://github.com/seu-user/healthapp.git
cd healthapp

# Suba a infraestrutura
docker compose -f infra/docker-compose.yml up -d

# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

Acesse:
- Frontend: http://localhost:3000
- API: http://localhost:3333/api
- Swagger: http://localhost:3333/api/docs

## Testes

```bash
# Backend
cd backend
npm test           # Unitários
npm run test:e2e   # Integração

# Frontend
cd frontend
npm test
```

## Deploy

### VPS
```bash
cp infra/.env.example .env
# Edite .env com suas credenciais
docker compose -f infra/docker-compose.prod.yml up -d
```

### Railway
- Conecte o repositório no Railway
- Adicione PostgreSQL plugin
- Configure variáveis de ambiente
- Deploy automático via GitHub

## Documentação

- [ADRs](/docs/adr) - Architecture Decision Records
- [Specs](/docs/specs) - BDD Feature files (Gherkin)
- [Skills](/skills) - Guia de desenvolvimento
