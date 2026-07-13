---
name: background-coder
description: >
  Write and fix code for apps/background (BullMQ workers).
  Triggered when the user requests code related to jobs, queues,
  workers, cron, or background tasks.
---

# Background Coder

## Context to read
1. [RULES.md](../../context/Rules/General/RULES.md)
2. [DB.md](../../context/Apps/General/DB.md)
3. [OVERVIEW.md](../../context/Apps/backend/OVERVIEW.md)
4. [JOBS.md](../../context/Apps/backend/JOBS.md)
5. [QUEUES.md](../../context/Apps/backend/QUEUES.md)

## Worker Pattern
```typescript
import { Worker, Job } from 'bullmq';

const worker = new Worker('<queue-name>', async (job: Job) => {
  const { data } = job;
  // 1. Validate input
  // 2. Process
  // 3. Return result
}, {
  connection: redisConnection,
  concurrency: 3,
});
```

## Rules
- Every job MUST be idempotent
- Log: start, progress, complete, error
- Timeout: set for every job
- Error: catch + log + optional retry

## Checklist
- [ ] Job idempotent
- [ ] Error handling + retry config
- [ ] Complete logging
- [ ] Update JOBS.md if adding a new job
- [ ] Build pass: `pnpm --filter background build`
