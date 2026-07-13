# Rule — Code style

1. TypeScript strict, no `any` (use `unknown` + type guard if unavoidable)
2. Naming: `camelCase` for variables/functions, `PascalCase` for components/classes, `SCREAMING_SNAKE` for constants
3. Max ~300 lines per file — split into modules if longer
4. No magic numbers/strings: put them in `packages/shared/constants`
5. Import order: builtin → external → `@myapp/*` → relative; let ESLint auto-sort
6. Error handling: always throw `AppError` with an error code, never throw strings
7. Comments explain "why", not "what"
8. Never commit `console.log` — use the app's logger
