# Site — apps/site

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Shadcn/ui
- Zustand (client state) + React Query (server state)
- React Hook Form + Zod

## Structure
```
apps/site/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx               ← Home
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx         ← Main layout with nav
│   │   ├── products/page.tsx
│   │   ├── products/[slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   └── orders/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx
│       └── profile/page.tsx
├── components/
│   ├── ui/                    ← Shadcn components
│   ├── layout/                ← Header, Footer, Sidebar
│   └── features/              ← Feature-specific components
├── hooks/
├── stores/
├── lib/
│   ├── api.ts
│   └── utils.ts
└── types/
```

## Commands
| Command | Description |
|---------|--------|
| `pnpm --filter site dev` | Dev server (port 3000) |
| `pnpm --filter site build` | Build |
| `pnpm --filter site test` | Component tests |
| `pnpm --filter site test:e2e` | E2E (Playwright) |
