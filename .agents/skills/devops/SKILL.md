---
name: devops
description: >
  Handles infrastructure, deployment, CI/CD, Docker, env config.
  Triggered when the user requests deploy, infra setup, CI/CD,
  docker, environment variables.
---

# DevOps

## Context to read
1. [STACK.md](../../context/Apps/General/STACK.md)

## Environments
| Env | URL | Branch | Deploy |
|-----|-----|--------|--------|
| Dev | localhost | * | — |
| Staging | staging.myapp.com | develop | Auto |
| Prod | myapp.com | main | Manual approve |

## Docker
- docker compose for dev: API + DB + Redis
- Multi-stage Dockerfile for production

## CI/CD (GitHub Actions)
```
Push → Lint → Test → Build → Deploy
                              ↓
              staging: auto   prod: manual
```

## Rules
- Do NOT change production config without asking the user
- Do NOT hardcode secrets
- Every new env var → update docs
- Migrations on prod → need a rollback plan

## Checklist
- [ ] Docker build succeeds
- [ ] CI pipeline passes
- [ ] Env vars documented
- [ ] Rollback plan (if migration)
