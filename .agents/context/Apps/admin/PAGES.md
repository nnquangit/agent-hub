# Admin Pages

## All pages require ADMIN+ role

| Route | Page | Description |
|-------|------|--------|
| `/` | Dashboard | KPIs, charts, recent orders |
| `/users` | Users | Data table, search, filter |
| `/users/:id` | User Detail | Profile, order history |
| `/products` | Products | Data table, CRUD |
| `/products/new` | New Product | Create form |
| `/products/:id/edit` | Edit Product | Edit form |
| `/orders` | Orders | Data table, filter by status |
| `/orders/:id` | Order Detail | Items, status update |
| `/settings` | Settings | App config (SUPER_ADMIN only) |

## Layout
- Sidebar: nav links, collapsible
- Topbar: search, notifications, user avatar
- Content: breadcrumb + page content
