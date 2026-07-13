# Directory structure

```
myapp/
├── apps/
│   ├── api/            # NestJS — modules/, prisma/, test/
│   ├── site/           # Next.js App Router — app/, components/, hooks/
│   ├── admin/          # Next.js — app/, features/
│   ├── landing/        # Next.js static — app/, content/
│   └── background/     # BullMQ workers — jobs/, queues/
├── packages/
│   ├── shared/         # shared types, constants, utils
│   ├── ui/             # shared React components (Button, Table…)
│   └── config/         # eslint, tsconfig, prettier presets
├── turbo.json
└── pnpm-workspace.yaml
```

## Placement conventions
- Code shared between 2+ apps → must go into `packages/shared` or `packages/ui`
- No cross-imports between apps (`apps/site` must not import from `apps/admin`)
- Each API module: `controller / service / module / dto / entities`
