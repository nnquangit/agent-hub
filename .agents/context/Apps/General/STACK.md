# Tech Stack

## Monorepo
- **Tool**: Turborepo
- **Package Manager**: pnpm (workspaces)
- **Language**: TypeScript 5.x (strict)
- **Linting**: ESLint + Prettier

## Backend — apps/api
- **Framework**: NestJS 10
- **ORM**: Prisma 5
- **Auth**: JWT (passport) + refresh token rotation
- **Validation**: class-validator + class-transformer
- **Docs**: Swagger (@nestjs/swagger)
- **Queue**: BullMQ

## Frontend — apps/admin, apps/site, apps/landing
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 3.x
- **State**: Zustand (client), React Query (server)
- **Forms**: React Hook Form + Zod
- **UI Library**: Shadcn/ui
- **Icons**: Lucide React

## Background — apps/background
- **Runtime**: Node.js 20 LTS
- **Queue**: BullMQ + Redis
- **Scheduling**: cron via BullMQ repeat

## Shared Packages
- `packages/shared` — Types, utils, constants, enums
- `packages/ui` — Shared React components (Shadcn-based)
- `packages/config` — ESLint, TSConfig, Prettier configs

## External Services
- **Database**: PostgreSQL 15
- **Cache / Queue**: Redis 7
- **Storage**: AWS S3
- **Email**: SendGrid
- **Payment**: Stripe

## Project Structure
```
apps/
├── api/              ← NestJS backend (port 4000)
├── admin/            ← Next.js admin dashboard (port 3001)
├── site/             ← Next.js main website (port 3000)
├── landing/          ← Next.js landing pages (port 3002)
└── background/       ← BullMQ workers
packages/
├── shared/           ← Shared types, utils
├── ui/               ← Shared UI components
└── config/           ← Shared configs
```
