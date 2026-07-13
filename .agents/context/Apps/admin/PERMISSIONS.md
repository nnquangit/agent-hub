# Admin Permissions

## Role Matrix
| Feature | ADMIN | SUPER_ADMIN |
|---------|-------|-------------|
| View dashboard | ✅ | ✅ |
| List/view users | ✅ | ✅ |
| Edit user role | ❌ | ✅ |
| Deactivate user | ❌ | ✅ |
| CRUD products | ✅ | ✅ |
| View all orders | ✅ | ✅ |
| Update order status | ✅ | ✅ |
| Cancel/refund order | ❌ | ✅ |
| App settings | ❌ | ✅ |

## UI Rules
- Hide buttons user doesn't have permission for
- Show disabled state with tooltip if needed
- Never hide nav items — show but disable
