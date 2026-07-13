# Database

## Connection
- **Engine**: PostgreSQL 15
- **ORM**: Prisma 5
- **Schema file**: `apps/api/prisma/schema.prisma`
- **Dev**: `postgresql://user:password@localhost:5432/myapp_dev`

## Tables

### users
| Column | Type | Note |
|--------|------|------|
| id | uuid (PK) | auto-generated |
| email | varchar(255) | unique, indexed |
| name | varchar(100) | |
| password_hash | varchar(255) | bcrypt, do NOT select |
| status | enum | ACTIVE, INACTIVE, BANNED |
| role | enum | USER, ADMIN, SUPER_ADMIN |
| created_at | timestamp | default now() |
| updated_at | timestamp | auto update |

### orders
| Column | Type | Note |
|--------|------|------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | indexed |
| total | decimal(10,2) | |
| status | enum | PENDING, PAID, SHIPPED, DELIVERED, CANCELLED |
| note | text | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

### products
| Column | Type | Note |
|--------|------|------|
| id | uuid (PK) | |
| name | varchar(200) | |
| slug | varchar(200) | unique, indexed |
| price | decimal(10,2) | |
| category | varchar(50) | indexed |
| stock | integer | >= 0 |
| is_active | boolean | default true |
| created_at | timestamp | |

### order_items
| Column | Type | Note |
|--------|------|------|
| id | uuid (PK) | |
| order_id | uuid (FK → orders) | cascade delete |
| product_id | uuid (FK → products) | |
| quantity | integer | > 0 |
| unit_price | decimal(10,2) | price at time of purchase |

## Relations
- users 1 → N orders
- orders 1 → N order_items
- products 1 → N order_items

## Rules
- Soft delete (set status / is_active), no hard delete
- Every query must have a LIMIT
- No JOINs across more than 3 tables in one query
- Index every FK and frequently filtered/sorted column
- Migration commands: `pnpm db:migrate`, `pnpm db:studio`
