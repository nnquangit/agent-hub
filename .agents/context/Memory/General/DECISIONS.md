# Memory — Finalized decisions

> Agents must respect these decisions and not re-propose them unless the user actively reopens the topic.

- **2026-05-12** — Chose BullMQ over Kafka for order sync: current scale doesn't need it, lower operating cost
- **2026-05-28** — Multi-tenancy via `tenant_id` column + Prisma middleware, NOT separate schema/DB per tenant
- **2026-06-03** — Dropped the plan to support Sendo; focus on Shopee + TikTok Shop through end of 2026
- **2026-06-20** — Billing uses Casso webhook for bank-transfer reconciliation; no international card gateway integration yet
- **2026-07-01** — Admin dashboard doesn't need mobile responsiveness, desktop-optimized only
