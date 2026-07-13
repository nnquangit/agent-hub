# MyApp Monorepo

## Apps

| App | Path | Stack | Port |
|-----|------|-------|------|
| api | `apps/api` | NestJS | 4000 |
| admin | `apps/admin` | Next.js | 3001 |
| site | `apps/site` | Next.js | 3000 |
| landing | `apps/landing` | Next.js | 3002 |
| background | `apps/background` | BullMQ workers | — |

## Packages

| Package | Path | Description |
|---------|------|--------|
| shared | `packages/shared` | Shared types, utils, constants |
| ui | `packages/ui` | Shared React components |
| config | `packages/config` | ESLint, TSConfig, Prettier |

## Determining the role

Based on the user's requested task, activate the right skill:

| Keyword | Skill |
|---------|-------|
| write/edit code + API, endpoint, service, controller | api-coder |
| test + API | api-tester |
| write/edit code + admin, dashboard | admin-coder |
| write/edit code + site, homepage, frontend | site-coder |
| test + site, component test, e2e | site-tester |
| write/edit code + landing, SEO | landing-coder |
| write/edit code + job, queue, worker, cron | background-coder |
| deploy, infra, CI/CD, docker, env | devops |

## Rules

- If the target app is unclear → ask the user
- If the task involves 2+ apps → activate skills for both
- Look at the file path (`apps/xxx/`) to determine the app
- Commit message format: `type(scope): message`

## Commands

| Command | Description |
|---------|--------|
| `pnpm dev` | Run all apps |
| `pnpm dev --filter api` | Run API only |
| `pnpm dev --filter admin` | Run Admin only |
| `pnpm dev --filter site` | Run Site only |
| `pnpm build` | Build all |
| `pnpm test` | Test all |
| `pnpm lint` | Lint all |
| `pnpm db:migrate` | Run Prisma migration |
