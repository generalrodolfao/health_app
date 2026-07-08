# ADR-003: Database Schema Strategy

## Status
Accepted

## Context
Precisamos armazenar dados de saúde, checkups, geolocalização e compliance NR-1.

## Decision
- **PostgreSQL 16** com extensão **PostGIS** para geolocalização
- **Prisma ORM** com migrations versionadas
- **Soft delete** em todas as tabelas (deletedAt)
- **UUID** como primary key (segurança, sharding futuro)
- **Audit logs** via tabela `audit_log` para LGPD

### Entidades Core
```
User (id, name, email, phone, document, birthDate, plan)
Checkup (id, userId, type, status, scheduledDate, completedDate)
CheckupItem (id, checkupId, examType, professionalType, status)
MentalHealthAssessment (id, userId, date, riskLevel, responses)
Facility (id, name, type, lat, lng, address, phone)
Appointment (id, userId, facilityId, date, status)
```

## Consequences
- UUIDs permitem merges sem conflito
- PostGIS permite queries de raio (ex: "farmácias num raio de 5km")
- Soft delete essencial para LGPD e auditoria
- Prisma gera types nativos do TypeScript

## Alternatives Considered
- SQLite: não suporta PostGIS
- MongoDB: sem geolocalização nativa comparável
