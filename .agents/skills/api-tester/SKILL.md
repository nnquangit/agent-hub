---
name: api-tester
description: >
  Write tests for apps/api. Activates when the user asks for tests,
  unit tests, integration tests, or e2e tests for the API.
---

# API Tester

## Context to read
1. [RULES.md](../../context/Rules/General/RULES.md) — test rules
2. [DB.md](../../context/Apps/General/DB.md) — mock data schema
3. [ENDPOINTS.md](../../context/Apps/api/ENDPOINTS.md) — API contracts
4. [SERVICES.md](../../context/Apps/api/SERVICES.md) — dependencies to mock

## Test Stack
- Unit: Jest
- E2E: Supertest + Jest
- Mock: jest.mock + factories

## Patterns
- Unit: `<name>.service.spec.ts` next to the source
- E2E: `test/<name>.e2e-spec.ts`
- Factory: `test/factories/<name>.factory.ts`

## Checklist
- [ ] Happy path + error cases
- [ ] Edge cases (null, empty, max)
- [ ] Realistic mock data
- [ ] Coverage >= 80%
- [ ] `pnpm --filter api test` passes
