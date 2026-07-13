# API — apps/api

## Stack
- NestJS 10 + TypeScript
- Prisma ORM
- JWT Auth (passport)
- Swagger docs at /api/docs

## Structure
```
apps/api/src/
├── modules/
│   ├── auth/          ← Login, register, refresh token
│   ├── user/          ← CRUD user, profile
│   ├── order/         ← Order management
│   └── product/       ← Product catalog
├── common/
│   ├── guards/        ← Auth, role guards
│   ├── filters/       ← Exception filters
│   ├── pipes/         ← Validation pipes
│   ├── decorators/    ← Custom decorators (@Public, @Roles, @CurrentUser)
│   └── interceptors/  ← Response transform, logging
├── config/            ← App config module
└── main.ts
```

## Module Pattern
```
modules/<name>/
├── <name>.controller.ts    ← Routes + validation
├── <name>.service.ts       ← Business logic
├── <name>.module.ts        ← DI wiring
├── dto/
│   ├── create-<name>.dto.ts
│   └── update-<name>.dto.ts
└── entities/
    └── <name>.entity.ts
```

## Commands
| Command | Description |
|---------|--------|
| `pnpm --filter api dev` | Dev server (port 4000) |
| `pnpm --filter api build` | Build |
| `pnpm --filter api test` | Run tests |
| `pnpm --filter api test:e2e` | E2E tests |
