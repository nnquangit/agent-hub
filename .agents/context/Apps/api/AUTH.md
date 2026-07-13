# Authentication & Authorization

## Auth Flow
1. User POST /auth/login with email + password
2. Server returns { accessToken, refreshToken }
3. Client sends `Authorization: Bearer <accessToken>`
4. When accessToken expires (15m), POST /auth/refresh
5. Server rotates refreshToken (old one invalidated)

## Token Config
| Token | Lifetime | Storage (client) |
|-------|----------|------------------|
| Access Token | 15 minutes | Memory / Zustand |
| Refresh Token | 7 days | HttpOnly cookie |

## Roles & Permissions
| Role | Permissions |
|------|-------------|
| USER | Read own profile, create/read own orders |
| ADMIN | All USER + manage users, products, all orders |
| SUPER_ADMIN | All ADMIN + delete users, system config |

## Guards (NestJS)
- `JwtAuthGuard` — verify JWT, attach user to request
- `RolesGuard` — check user role against `@Roles()` decorator
- Applied globally except routes with `@Public()` decorator

## Implementation
- Library: @nestjs/passport + passport-jwt
- Password: bcrypt (salt rounds: 10)
- Token: jsonwebtoken, secret from env `JWT_SECRET`
- Refresh tokens stored in DB table `refresh_tokens`
