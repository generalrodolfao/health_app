# HealthApp Skills Package

Pacote de skills para desenvolvimento do HealthApp com máxima qualidade.

## Frontend (Next.js + React + Tailwind)

### Estilo
- Tailwind CSS v4 com design tokens customizados
- Componentes puros sem bibliotecas externas de UI
- Lucide React para ícones
- Leaflet + OpenStreetMap para mapas (gratuito, sem API key)
- Responsivo mobile-first

### Padrões
- 'use client' explícito onde necessário
- Server components por padrão no Next.js 15 App Router
- Estado local com useState (MVP), migrar para Zustand quando crescer
- Formulários com validação no frontend + backend
- Fetch via lib/api.ts centralizado

### Qualidade
- ESLint + Prettier
- TypeScript strict
- Testes com Jest + Testing Library
- Performance: next/image, lazy loading, dynamic imports

## Backend (NestJS + Prisma + PostgreSQL)

### Arquitetura
- Modular hexagonal (domain/application/infrastructure/presentation)
- Injeção de dependência nativa do NestJS
- DTOs com class-validator para validação
- OpenAPI/Swagger automático

### Banco de Dados
- Prisma ORM com migrations versionadas
- PostgreSQL 16 + PostGIS para geolocalização
- UUID como PK
- Soft delete em todas as entidades
- Audit log para LGPD

### Segurança
- JWT com Passport Strategy
- bcrypt com salt 12
- Helmet para headers HTTP
- Rate limiting (@nestjs/throttler)
- CORS configurado

### Qualidade
- Testes unitários (Jest) por módulo
- Testes E2E (Supertest)
- Cobertura mínima: 80%
- Healthcheck endpoint

## Code Review Checklist

### Funcional
- [ ] Atende aos critérios de aceitação da spec?
- [ ] Trata erros e edge cases?
- [ ] Valida entrada do usuário?
- [ ] Testes passam?

### Arquitetura
- [ ] Segue padrão do módulo (domain/application/infrastructure/presentation)?
- [ ] Não acopla camadas indevidamente?
- [ ] DTOs/Interfaces estão tipadas corretamente?

### Segurança
- [ ] Endpoints protegidos com @UseGuards(AuthGuard)?
- [ ] Não expõe dados sensíveis?
- [ ] Valida permissões de acesso?

### Performance
- [ ] Queries N+1 evitadas?
- [ ] Paginação em listas?
- [ ] Índices no banco criados?

### Código
- [ ] Sem console.log/debug em produção?
- [ ] Imports organizados?
- [ ] Nomes descritivos?
- [ ] Cobertura de testes adequada?

## Deploy

### VPS (Primeiro)
```bash
# Setup inicial
git clone https://github.com/seu-user/healthapp.git
cd healthapp
cp infra/.env.example .env
# Editar .env com suas credenciais
docker compose -f infra/docker-compose.prod.yml up -d
```

### Railway (Futuro)
```bash
# Railway detecta railway.json
# Configure DATABASE_URL e JWT_SECRET no dashboard Railway
# Conecte PostgreSQL via Railway plugin
# Deploy automático via GitHub
```

## Comandos Úteis

```bash
# Backend
cd backend
npm run start:dev        # Desenvolvimento
npm run test             # Testes unitários
npm run test:e2e         # Testes E2E
npm run prisma:studio    # Admin do banco
npm run prisma:migrate   # Migrations

# Frontend
cd frontend
npm run dev              # Desenvolvimento
npm run build            # Produção
npm run test             # Testes

# Infra
docker compose up -d     # Subir tudo
docker compose logs -f   # Ver logs
```
