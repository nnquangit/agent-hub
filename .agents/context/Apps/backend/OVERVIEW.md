# Background — apps/background

## Stack
- Node.js 20 + TypeScript
- BullMQ + Redis
- Shared Prisma client

## Structure
```
apps/background/src/
├── workers/
│   ├── email.worker.ts
│   ├── payment.worker.ts
│   ├── maintenance.worker.ts
│   ├── report.worker.ts
│   └── sync.worker.ts
├── queues/
│   └── index.ts
├── utils/
│   └── logger.ts
└── main.ts
```

## Commands
| Command | Description |
|---------|--------|
| `pnpm --filter background dev` | Start workers |
| `pnpm --filter background build` | Build |
