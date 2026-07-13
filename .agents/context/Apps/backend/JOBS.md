# Background Jobs

| Job | Queue | Schedule | Description |
|-----|-------|----------|--------|
| SendEmailJob | email | on event | Send transactional emails |
| CleanupTokensJob | maintenance | 0 2 * * * | Delete expired tokens, 2AM |
| DailyReportJob | report | 0 7 * * * | Reports, 7AM daily |
| SyncInventoryJob | sync | */15 * * * * | Sync inventory, every 15 min |
| ProcessPaymentJob | payment | on event | Async payments |

## Retry Policy
- Default: 3 attempts, exponential backoff (1s, 5s, 30s)
- Payment: 5 attempts (5s, 30s, 2m, 10m, 30m)
- Email: 3 attempts, fail → log + alert

## Rules
- Every job must be idempotent
- Log input + output
- Failed → alert Slack #backend-alerts
- No queries > 100 rows/job
