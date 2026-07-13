---
name: admin-coder
description: >
  Write and fix code for apps/admin (Next.js admin dashboard).
  Triggered when the user requests code related to admin, dashboard,
  data tables, analytics, or user/product/order management.
---

# Admin Coder

## Context to read
1. [RULES.md](../../context/Rules/General/RULES.md)
2. [STACK.md](../../context/Apps/General/STACK.md)
3. [OVERVIEW.md](../../context/Apps/admin/OVERVIEW.md)
4. [PAGES.md](../../context/Apps/admin/PAGES.md)
5. [PERMISSIONS.md](../../context/Apps/admin/PERMISSIONS.md)
6. [ENDPOINTS.md](../../context/Apps/api/ENDPOINTS.md) — API contracts

## Patterns
- Data tables: reusable DataTable component + column definitions
- Forms: React Hook Form + Zod schema
- Charts: Recharts with consistent styling
- Always check role permissions before showing actions

## Checklist
- [ ] Permission checks for role-gated features
- [ ] Data table: sort, filter, search, pagination
- [ ] Forms: validation, loading state, error display
- [ ] Responsive layout
- [ ] Build pass: `pnpm --filter admin build`
