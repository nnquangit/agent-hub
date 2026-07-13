# Landing — apps/landing

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion (animations)

## Purpose
Marketing landing pages — SEO-optimized, fast, static.

## Structure
```
apps/landing/src/app/
├── page.tsx               ← Main landing page
├── pricing/page.tsx
├── about/page.tsx
├── contact/page.tsx
└── blog/
    ├── page.tsx
    └── [slug]/page.tsx
```

## SEO Rules
- Every page: title, meta description, og:image
- Use Next.js Metadata API
- Images: next/image with alt text
- Single h1, then h2, h3
- Sitemap: auto-generated

## Commands
| Command | Description |
|---------|--------|
| `pnpm --filter landing dev` | Dev (port 3002) |
| `pnpm --filter landing build` | Static build |
