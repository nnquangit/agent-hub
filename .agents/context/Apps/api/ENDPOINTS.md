# API Endpoints

## Base URL
`/api/v1`

## Auth
| Method | Path | Auth | Description |
|--------|------|------|--------|
| POST | /auth/register | ❌ | Register |
| POST | /auth/login | ❌ | Login, returns JWT |
| POST | /auth/refresh | ❌ | Refresh token |
| POST | /auth/logout | ✅ | Logout, revoke token |
| GET | /auth/me | ✅ | Current user info |

## Users
| Method | Path | Auth | Role | Description |
|--------|------|------|------|--------|
| GET | /users | ✅ | ADMIN | List users (paginated) |
| GET | /users/:id | ✅ | ADMIN | User detail |
| PATCH | /users/:id | ✅ | ADMIN | Update user |
| DELETE | /users/:id | ✅ | SUPER_ADMIN | Deactivate user |

## Products
| Method | Path | Auth | Description |
|--------|------|------|--------|
| GET | /products | ❌ | List products (paginated) |
| GET | /products/:slug | ❌ | Product detail |
| POST | /products | ✅ ADMIN | Create product |
| PATCH | /products/:id | ✅ ADMIN | Update product |
| DELETE | /products/:id | ✅ ADMIN | Deactivate product |

## Orders
| Method | Path | Auth | Description |
|--------|------|------|--------|
| GET | /orders | ✅ | List orders (own/all for ADMIN) |
| GET | /orders/:id | ✅ | Order detail |
| POST | /orders | ✅ | Create order |
| PATCH | /orders/:id/status | ✅ ADMIN | Update order status |

## Response Format
```json
{
  "data": "T | null",
  "meta": { "page": 1, "limit": 20, "total": 100 },
  "error": { "code": "VALIDATION_ERROR", "message": "..." }
}
```

## Pagination
- Query params: `?page=1&limit=20`
- Default limit: 20, max: 100

## Error Codes
| Code | HTTP | Description |
|------|------|--------|
| VALIDATION_ERROR | 422 | Input validation failed |
| UNAUTHORIZED | 401 | Missing/invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Duplicate resource |
| INTERNAL_ERROR | 500 | Server error |
