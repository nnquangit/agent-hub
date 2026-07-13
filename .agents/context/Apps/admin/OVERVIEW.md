# Admin — apps/admin

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Shadcn/ui
- React Query + Zustand
- Recharts (charts/analytics)

## Structure
```
apps/admin/src/
├── app/
│   ├── layout.tsx             ← Admin shell (sidebar + topbar)
│   ├── page.tsx               ← Dashboard overview
│   ├── users/page.tsx
│   ├── users/[id]/page.tsx
│   ├── products/page.tsx
│   ├── products/new/page.tsx
│   ├── orders/page.tsx
│   └── settings/page.tsx
├── components/
│   ├── data-table/
│   ├── charts/
│   └── forms/
└── hooks/
```

## Access
- Only ADMIN and SUPER_ADMIN roles
- Redirect to /login if unauthorized

## Commands
| Command | Description |
|---------|--------|
| `pnpm --filter admin dev` | Dev (port 3001) |
| `pnpm --filter admin build` | Build |
