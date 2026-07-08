# ADR-002: Architecture Pattern

## Status
Accepted

## Context
Arquitetura modular, testável, com separação clara de responsabilidades.

## Decision
Arquitetura **Modular Hexagonal** (Ports & Adapters adaptado):

```
src/
├── modules/
│   ├── auth/       # Login, registro, JWT
│   ├── users/      # Perfil, onboarding
│   ├── checkups/   # Core: checkups, exames, agendamentos
│   │   ├── domain/       # Entities, value-objects
│   │   ├── application/  # Use-cases
│   │   ├── infrastructure/ # Prisma, repositories
│   │   └── presentation/  # Controllers, DTOs
│   ├── nr1/        # NR-1 mental health compliance
│   └── facilities/ # Mapa farmácias/hospitais (PostGIS)
├── common/         # Guards, filters, interceptors, pipes
└── main.ts
```

## Consequences
- Cada módulo é isolado e testável
- Fácil adicionar novos módulos (ex: telemedicina, receitas)
- Prisma abstrai o banco, troca de DB não afeta domínio

## Alternatives Considered
- Clean Architecture (mais boilerplate para MVP)
- Monólito simples (baixa testabilidade)
