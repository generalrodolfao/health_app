# Deploy Troubleshooting — Lições Aprendidas

Documento os 17 problemas encontrados no primeiro deploy para Railway/VPS e
como cada um foi resolvido. Útil para evitar os mesmos erros em projetos futuros.

---

## Resumo Executivo

Foram necessários **12 commits de correção** antes do primeiro deploy
bem-sucedido. A maioria dos problemas poderia ser evitada com 3 práticas:

1. **Validar o build Docker localmente** antes de push (`docker build .`)
2. **Gerar `package-lock.json`** desde o primeiro commit
3. **Testar `npm run build` e verificar `dist/main.js`** antes de push

---

## Problemas Encontrados (ordem cronológica)

### 1. `package-lock.json` ausente

**Sintoma**: `npm ci` falha no Docker build com "No lockfile found".

**Causa**: Projeto iniciado com `package.json` mas sem `npm install` prévio,
logo sem lockfile. `npm ci` exige `package-lock.json`.

**Solução**: Rodar `npm install --package-lock-only` para gerar o lockfile
antes do primeiro commit.

**Prevenção**: Sempre rodar `npm install` ao criar o `package.json` e
commitar o `package-lock.json`.

---

### 2. Versão de pacote inexistente (`@nestjs/throttler@^7.0.0`)

**Sintoma**: `npm install` falha com `ETARGET: No matching version found`.

**Causa**: `@nestjs/throttler` latest era `6.5.0`, não `7.0.0`. Versão
chutada no `package.json` sem verificar.

**Solução**: Trocar para `^6.0.0`.

**Prevenção**: Sempre validar versões com `npm view <pkg> version` antes
de adicionar ao `package.json`. Ou instalar via `npm install <pkg>` que
resolve a versão automaticamente.

---

### 3. Schema Prisma com relations incompletas

**Sintoma**: `prisma generate` falha com "The relation field X is missing
an opposite relation field on model Y".

**Causa**: Models `MentalHealthAssessment` e `MentalHealthAction` tinham
`companyId` mas sem o campo `company` com `@relation`. O Prisma exige
relations bidirecionais.

**Solução**: Adicionar campos inversos:
- `Company.assessments MentalHealthAssessment[]`
- `Company.actions MentalHealthAction[]`
- `MentalHealthAssessment.company Company? @relation(...)`
- `MentalHealthAction.company Company @relation(...)`

**Prevenção**: Rodar `npx prisma validate` antes de commitar mudanças no
schema. Adicionar ao pre-commit hook.

---

### 4. `HealthController` não registrado no `AppModule`

**Sintoma**: Healthcheck do Docker/Railway falha (rota `/api/health` não
existe → 404 → container marcado como unhealthy).

**Causa**: Controller criado mas não adicionado ao `controllers: []` do
`AppModule`.

**Solução**: Adicionar `controllers: [HealthController]` no `AppModule`.

**Prevenção**: Sempre rodar `npm run build` — se um controller não está
registrado, o NestJS não mapeia a rota. Verificar logs de bootstrap.

---

### 5. `nest-cli.json` usando SWC sem `@swc/core` instalado

**Sintoma**: Build warning: "typeCheck will not have any effect when
builder is not swc" ou build falha silenciosamente.

**Causa**: `nest-cli.json` tinha `"builder": "swc"` mas `@swc/core` não
estava nas devDependencies.

**Solução**: Remover `"builder": "swc"` do `nest-cli.json` (usar builder
padrão tsc) OU instalar `@swc/core` + `@swc/cli`.

**Prevenção**: Testar `npm run build` localmente antes de push.

---

### 6. Dockerfile: deps de produção e dev separadas incorretamente

**Sintoma**: Build completa mas `node dist/main` falha com
`Cannot find module` em produção.

**Causa**: Dockerfile fazia `npm ci --only=production` seguido de
`npm ci --only=development` — o segundo sobrescrevia node_modules,
deixando só devDeps. Depois `npm prune --production` removia tudo.

**Solução**: Fazer `npm ci` (instala tudo) → `npm run build` →
`npm prune --production` (remove devDeps após o build).

**Prevenção**: Padrão correto de Dockerfile multi-stage para Node:
```dockerfile
COPY package.json package-lock.json ./
RUN npm ci                    # tudo
COPY src/ src/
RUN npm run build
RUN npm prune --production    # só prod deps
```

---

### 7. Railway: build context é sempre o repo root

**Sintoma**: `failed to calculate checksum: "/package.json": not found`

**Causa**: Railway não tem campo `buildContext` no `railway.json`. O
context é sempre a raiz do repo. Mas `backend/Dockerfile` usava
`COPY package.json ./` (relativo ao subdir), que falha com context=root.

**Solução**: Dockerfile usa paths root-relative:
```dockerfile
COPY backend/package.json backend/package-lock.json ./
COPY backend/src/ src/
COPY backend/prisma/ prisma/
```

**Prevenção**: Para monorepos no Railway, sempre usar paths root-relative
no Dockerfile. Ou criar o Dockerfile na raiz do repo.

---

### 8. Railway: dashboard settings sobrescrevem `railway.json`

**Sintoma**: Mudamos `railway.json` para apontar para novo Dockerfile,
mas Railway continuou carregando o path antigo.

**Causa**: Configurações definidas manualmente no dashboard (Dockerfile
Path, Start Command) têm prioridade sobre `railway.json`.

**Solução**: Ou alinhar o dashboard com o `railway.json`, ou excluir o
service e recriar (que foi o que funcionou).

**Prevenção**: Ao criar um service no Railway, configurar tudo via
`railway.json` desde o início. Evitar setar Dockerfile Path manualmente
no dashboard se ele já está no JSON.

---

### 9. Railway: `VOLUME` no Dockerfile não é suportado

**Sintoma**: `dockerfile invalid: docker VOLUME at Line X is not supported`

**Causa**: Railway gerencia volumes via dashboard/CLI, não via instrução
`VOLUME` do Dockerfile.

**Solução**: Remover `VOLUME` do Dockerfile. Criar volume via Railway
dashboard (Settings → Volumes → mount path).

**Prevenção**: Consultar a documentação do Railway sobre limitações do
Dockerfile antes de escrever o Dockerfile.

---

### 10. App crashava se `DATABASE_URL` não estava configurada

**Sintoma**: Container inicia e morre imediatamente. Healthcheck falha.
Railway mostra "1/1 replicas never became healthy".

**Causa**: `PrismaService.$connect()` no `onModuleInit` lançava exceção
se DB não estava acessível, derrubando todo o processo NestJS.

**Solução**: Tornar `PrismaService` resiliente — capturar erro de
conexão, marcar `isConnected = false`, e deixar a app bootar mesmo sem
DB. HealthController retorna status `degraded` (200 OK) em vez de 500.

**Prevenção**: Serviços de infra (DB, cache, queues) devem ter conexão
lazy/resiliente. A app deve bootar mesmo se dependências externas falham.

---

### 11. SQLite em vez de PostgreSQL (simplificação para teste)

**Sintoma**: Sem plugin PostgreSQL no Railway, app não funcionava.

**Causa**: PostgreSQL requer plugin pago ou volume configurado. Para
teste rápido, SQLite (arquivo local) é suficiente.

**Solução**: Trocar `provider = "postgresql"` para `"sqlite"` no
`schema.prisma`. Remover tipos PG-specific (`@db.Uuid`, `@db.SmallInt`,
`String[]`, `mode: 'insensitive'`). `DATABASE_URL = "file:/app/data.db"`.

**Prevenção**: Para MVP/teste, começar com SQLite. Migrar para
PostgreSQL quando precisar de concorrência ou dados persistentes em
deploy.

---

### 12. `startCommand` do Railway apontando para `/start.sh` inexistente

**Sintoma**: "The executable /start.sh could not be found" — container
não inicia.

**Causa**: Railway dashboard tinha Start Command = `/start.sh` hardcoded
(override do `railway.json`). O Dockerfile não copiava `start.sh` para
a imagem.

**Solução**: Adicionar `COPY start.sh /start.sh` + `RUN chmod +x
/start.sh` no Dockerfile. Garantir que `start.sh` existe no repo e não
está no `.dockerignore`.

**Prevenção**: Se definir Start Command no Railway, garantir que o
arquivo existe no Dockerfile. Ou remover Start Command do dashboard e
deixar o `CMD` do Dockerfile rodar.

---

### 13. `nest build` output em `dist/src/main.js` em vez de `dist/main.js`

**Sintoma**: `Error: Cannot find module '/app/dist/main'` — node não
encontra o entrypoint.

**Causa**: `tsconfig.json` não tinha `rootDir`. Sem `rootDir`, o tsc
preserva a estrutura de diretórios: `src/main.ts` → `dist/src/main.js`.

**Solução**: Adicionar `"rootDir": "./src"` no `tsconfig.json`. Agora
`src/main.ts` → `dist/main.js`.

**Prevenção**: Sempre após `npm run build`, verificar com
`find dist -name "main.js"` se o arquivo está no path esperado.

---

### 14. Frontend não deployado

**Sintoma**: Só a API estava no ar. Frontend não tinha Dockerfile nem
service no Railway.

**Causa**: Na limpeza do projeto, removemos os Dockerfiles do frontend.
Só o backend foi deployado.

**Solução**: Integrar frontend no mesmo container. Next.js com
`output: 'export'` (static HTML) servido pelo NestJS via
`@nestjs/serve-static`. Uma URL, uma porta, tudo junto.

**Prevenção**: Decidir a estratégia de deploy do frontend antes de
remover arquivos. Para MVP, single-container é mais simples.

---

### 15. `.dockerignore` excluindo arquivos necessários

**Sintoma**: Build completa mas faltam arquivos no container.

**Causa**: `.dockerignore` muito agressivo, excluindo `start.sh`,
`public/`, etc.

**Solução**: Revisar `.dockerignore` para incluir apenas o que realmente
não é necessário (`node_modules`, `.git`, `coverage`, `docs`).

**Prevenção**: Testar `docker build` localmente e verificar se todos os
arquivos esperados estão na imagem com `docker run --rm <img> ls -la /app`.

---

### 16. JWT/Auth quebrando sem `JWT_SECRET`

**Sintoma**: App crashava no boot porque `JwtModule.register()` não
tinha `JWT_SECRET` configurado.

**Causa**: Módulo de auth importava `@nestjs/jwt` que exigia a env var.
Sem ela, o módulo falhava ao inicializar.

**Solução**: Remover módulo de auth entirely para o MVP de teste. API
pública sem autenticação.

**Prevenção**: Variáveis de ambiente obrigatórias devem ter fallback ou
a app deve bootar em modo degraded sem elas.

---

### 17. `npm notice` poluindo logs de startup

**Sintoma**: Logs de deploy cheios de warnings de npm.

**Causa**: `npx prisma db push` no `start.sh` mostra notices do npm.

**Solução**: Redirecionar output desnecessário: `2>&1 | tail -3`.

**Prevenção**: Scripts de startup devem ser silenciosos. Só mostrar
erros reais.

---

## Checklist Pre-Deploy (para não repetir os erros)

Antes de fazer push para o repositório que fará deploy automático:

### Local (obrigatório)
- [ ] `npm install` rodado e `package-lock.json` commitado
- [ ] `npm run build` — sem erros
- [ ] `find dist -name "main.js"` — confirma que está no path esperado
- [ ] `npx prisma validate` — schema válido
- [ ] `npx prisma generate` — client gerado sem erros
- [ ] `npm test` — todos os testes passam
- [ ] `npm run typecheck` — sem erros de tipo
- [ ] Todas as versões do `package.json` existem no npm

### Docker (recomendado)
- [ ] `docker build -f Dockerfile -t test .` — build completa
- [ ] `docker run --rm test ls -la /app` — arquivos esperados presentes
- [ ] `docker run --rm -p 3333:3333 test` — app inicia e responde
- [ ] `curl http://localhost:3333/api/health` — retorna 200

### Railway/Deploy
- [ ] `railway.json` sem `startCommand` se o Dockerfile tem `CMD`
- [ ] Dockerfile usa paths root-relative (context = repo root)
- [ ] Sem `VOLUME` no Dockerfile (Railway não suporta)
- [ ] Variáveis de ambiente com fallback ou app boot sem elas
- [ ] Healthcheck endpoint retorna 200 mesmo com DB down
- [ ] `.dockerignore` não exclui arquivos necessários (`start.sh`, `public/`)

---

## Timeline de Commits de Correção

| Commit | Problema |
|--------|----------|
| `d43d0d0` | Lock files, Dockerfiles, Prisma relations, HealthController, Traefik |
| `51b628b` | Railway monorepo build context (root Dockerfiles) |
| `a396121` | Unify Dockerfiles with root-relative paths |
| `2fd0c18` | Remove VOLUME (Railway doesn't support) |
| `d4ea648` | Resilient startup (app boots without DB) |
| `935a40a` | Self-contained PostgreSQL+Node container |
| `b742cb4` | Switch to SQLite, remove JWT (minimal test) |
| `162d9c3` | Remove /start.sh startCommand |
| `cf09c18` | Add start.sh to Dockerfile |
| `0343b6e` | Use `sh /start.sh` as CMD |
| `a15060d` | Clean project (single Dockerfile, no auth) |
| `895e9fb` | Fix nest build output path (rootDir in tsconfig) |
| `3ba2016` | Serve frontend from same container |

Total: **13 commits de correção** para chegar ao primeiro deploy funcional.
