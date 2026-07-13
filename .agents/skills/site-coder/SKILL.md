---
name: site-coder
description: >
  Write and fix code for apps/site (Next.js frontend).
  Activates when the user requests code related to the UI, pages,
  components, or layout of the main site.
---

# Site Coder

## Context to read
1. [RULES.md](../../context/Rules/General/RULES.md)
2. [STACK.md](../../context/Apps/General/STACK.md)
3. [OVERVIEW.md](../../context/Apps/site/OVERVIEW.md)
4. [PAGES.md](../../context/Apps/site/PAGES.md)
5. [UI.md](../../context/Apps/site/UI.md)
6. [STATE.md](../../context/Apps/site/STATE.md)

## Component Pattern
```
components/<ComponentName>/
├── index.tsx
├── <ComponentName>.tsx
├── <ComponentName>.types.ts
└── <ComponentName>.module.css (if needed)
```

## Rules
- Server Components by default
- Client only when: onClick, useState, useEffect → 'use client'
- Loading + error states required
- Always responsive (mobile first)
- Use Shadcn/ui components

## Checklist
- [ ] Props typed, component reusable
- [ ] Responsive
- [ ] Loading + error states
- [ ] Accessible
- [ ] `pnpm --filter site build` pass
