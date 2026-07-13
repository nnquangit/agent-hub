# Rule — Testing

1. New code in `apps/api` must have unit tests for services (Jest), service coverage ≥ 80%
2. New endpoint → add e2e test (supertest) for the happy path + 1 error case
3. Site/Admin: components with logic → test with React Testing Library; main flows → Playwright e2e
4. Do not mock Prisma in e2e — use a test DB (docker compose `db-test`)
5. Place test files next to the code: `*.spec.ts` (unit), `test/` (e2e)
6. Run before pushing: `pnpm test --filter <app>`
7. Bug fixes must include a regression test that reproduces the bug
