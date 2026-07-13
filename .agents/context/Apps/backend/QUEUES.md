# Queue Configuration

## Redis
- Dev: redis://localhost:6379
- Staging/Prod: env REDIS_URL

## Queues
| Queue | Concurrency | Rate Limit |
|-------|-------------|------------|
| email | 5 | 10/sec |
| payment | 3 | 5/sec |
| maintenance | 1 | — |
| report | 1 | — |
| sync | 2 | — |

## Dead Letter Queue
- Failed after max retries → DLQ
- Retention: 7 days
- Alert when DLQ > 10 jobs
