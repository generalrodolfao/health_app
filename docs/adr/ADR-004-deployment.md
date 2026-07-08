# ADR-004: Deployment Strategy

## Status
Accepted

## Context
Primeiro deploy em VPS, migração futura para Railway. Precisa ser portável.

## Decision
- **Docker Compose** para ambiente dev + VPS
- **Docker multi-stage** para produção (imagem leve ~150MB)
- **Railway.json** configurado para deploy sem alterações
- **GitHub Actions** para CI/CD (lint, test, build, deploy)
- **Traefik** como reverse proxy na VPS (SSL automático)
- **Healthcheck** endpoints em /health

### Estrutura
```
infra/
├── docker-compose.yml       # Dev + VPS
├── docker-compose.prod.yml  # Override produção
├── traefik.yml              # Config reverse proxy
└── .env.example

railway.json                 # Config Railway
```

## Consequences
- Um comando sobe tudo: `docker compose up`
- Zero mudança para migrar de VPS para Railway
- Traefik faz SSL automático (Let's Encrypt)
- CI/CD roda testes antes de qualquer deploy

## Alternatives Considered
- Kubernetes: overkill para MVP
- Vercel-only: backend não roda no Vercel
