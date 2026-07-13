# Site Pages & Routes

## Public Pages
| Route | Page | Description |
|-------|------|--------|
| `/` | Home | Landing + featured products |
| `/products` | Product List | Filterable, paginated |
| `/products/:slug` | Product Detail | Info, add to cart |
| `/login` | Login | Email + password |
| `/register` | Register | Sign up form |

## Protected Pages (login required)
| Route | Page | Description |
|-------|------|--------|
| `/cart` | Cart | Cart items, checkout |
| `/orders` | Order List | User's orders |
| `/orders/:id` | Order Detail | Order info + items |
| `/profile` | Profile | User info, change password |

## Layouts
- `(auth)` layout — centered card, no nav
- `(main)` layout — header + footer + nav
- `(dashboard)` layout — sidebar + content

## Navigation
- Header: Logo, Products, Cart (badge), User menu
- User menu: Profile, Orders, Logout
- Mobile: hamburger menu
