---
name: site-tester
description: >
  Writes tests for apps/site. Activated when the user requests
  component tests or e2e tests for the site.
---

# Site Tester

## Context to read
1. [RULES.md](../../context/Rules/General/RULES.md)
2. [UI.md](../../context/Apps/site/UI.md)
3. [PAGES.md](../../context/Apps/site/PAGES.md)

## Test Stack
- Component: Vitest + React Testing Library
- E2E: Playwright

## Patterns
- Component: `<Name>.test.tsx` next to the source
- E2E: `tests/<flow>.spec.ts`
- Test: render, interaction, edge cases

## Checklist
- [ ] Render + interaction tested
- [ ] Edge cases covered
- [ ] E2E for critical flows
- [ ] Tests pass
