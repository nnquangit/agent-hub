# Memory — Temporary notes

> Short-term notes between work sessions. Clean up periodically; delete when no longer useful.

- Shopee API v2 rate limit 1000 req/min/shop — sync worker is hitting the limit for shops with >5k orders/day, needs batching (in progress, see `apps/background/jobs/sync-shopee.ts`)
- Recurring bug: TikTok webhook sends duplicate `order.updated` events — idempotency key added, monitor for 1 more week (from 2026-07-06)
- Landing page: wait for new content from marketing before building the pricing section
- Shopee staging account expires 2026-07-20, remember to renew
