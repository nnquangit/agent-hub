# State Management

## Client State — Zustand
```typescript
useAuthStore: { user, token, login(), logout(), isAuthenticated }
useCartStore: { items, addItem(), removeItem(), updateQuantity(), total, clearCart() }
useUIStore: { sidebarOpen, theme, toggleSidebar(), setTheme() }
```

## Server State — React Query
```typescript
useProducts(filters)     → GET /products
useProduct(slug)         → GET /products/:slug
useOrders()              → GET /orders
useOrder(id)             → GET /orders/:id
useCreateOrder()         → POST /orders (mutation)
useLogin()               → POST /auth/login (mutation)
useRegister()            → POST /auth/register (mutation)
useCurrentUser()         → GET /auth/me
```

## Rules
- Server state: React Query (cache, refetch, optimistic updates)
- Client state: Zustand (UI, auth token, cart)
- No prop drilling — use stores/hooks
- Invalidate queries after mutations
