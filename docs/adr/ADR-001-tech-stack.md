# ADR-001: Tech Stack

## Status
Accepted

## Context
Precisamos de uma stack moderna, com alta disponibilidade de mão de obra no Brasil, para um SaaS de monitoramento de saúde.

## Decision
| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Linguagem | TypeScript | #1 em disponibilidade de devs no BR (43.4%) |
| Backend | NestJS 11 | Framework modular, testável, similar ao Angular |
| Frontend | Next.js 15 (App Router) | SSR, SEO, Vercel-ready |
| Database | PostgreSQL 16 + PostGIS | Geolocalização + confiabilidade |
| ORM | Prisma 6 | Type-safe, migrations automáticas |
| Cache/Queue | Redis 7 | Sessões, filas, cache |
| API Spec | OpenAPI 3.1 (auto via @nestjs/swagger) |
| Auth | JWT + bcrypt |
| Map | Leaflet (open-source, sem API key obrigatória) |
| Maps API | OpenStreetMap + Nominatim (gratuito) |

## Consequences
- Pool massivo de devs TypeScript no Brasil
- PostgreSQL com PostGIS resolve mapa sem dependência externa paga
- Leaflet + OSM = zero custo de mapa no MVP
- Prisma acelera desenvolvimento em 2x comparado a raw SQL

## Alternatives Considered
- Python/Django: rejeitado por menor pool de devs fullstack
- Java/Spring: rejeitado por verbosidade e lentidão no MVP
- MongoDB: rejeitado por falta de suporte nativo a geolocalização
