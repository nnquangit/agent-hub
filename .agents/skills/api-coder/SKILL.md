---
name: api-coder
description: >
  Write and modify code for apps/api (NestJS backend).
  Triggered when the user requests code related to APIs, endpoints,
  services, controllers, middleware, or guards.
---

# API Coder

## Context to read
1. [RULES.md](../../context/Rules/General/RULES.md)
2. [STACK.md](../../context/Apps/General/STACK.md)
3. [DB.md](../../context/Apps/General/DB.md)
4. [OVERVIEW.md](../../context/Apps/api/OVERVIEW.md)
5. [ENDPOINTS.md](../../context/Apps/api/ENDPOINTS.md)
6. [AUTH.md](../../context/Apps/api/AUTH.md)
7. [SERVICES.md](../../context/Apps/api/SERVICES.md)

## Module Pattern
```
modules/<name>/
├── <name>.controller.ts
├── <name>.service.ts
├── <name>.module.ts
├── dto/
│   ├── create-<name>.dto.ts
│   └── update-<name>.dto.ts
└── entities/
    └── <name>.entity.ts
```

## Response Format
```typescript
{ data: T | null, meta: { page, limit, total } | null, error: { code, message } | null }
```

## Checklist
- [ ] Code follow RULES.md
- [ ] DTOs have class-validator decorators
- [ ] Services have error handling
- [ ] Endpoints have auth guards (except @Public)
- [ ] Update ENDPOINTS.md when adding new routes
- [ ] Build pass: `pnpm --filter api build`
