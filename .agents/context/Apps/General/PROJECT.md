# MyApp — Project overview

## Product
A multi-channel sales management SaaS platform for Vietnamese SMEs: syncs orders from Shopee/Lazada/TikTok Shop, manages inventory, and provides revenue reports.

## Users
- **Shop owners**: view dashboards, reports, configure sales channels
- **Staff**: process orders, update inventory
- **Internal admins**: manage tenants, billing, support

## Apps in the monorepo
| App | Purpose | Port |
|-----|----------|------|
| api | NestJS backend, REST + webhooks | 4000 |
| site | Main web app for shop owners | 3000 |
| admin | Internal admin dashboard | 3001 |
| landing | Marketing site, SEO | 3002 |
| background | Order-sync worker, cron | — |

## Current milestone
- Stage: private beta, ~40 shops in use
- Q3 priorities: stabilize Shopee sync, launch billing
