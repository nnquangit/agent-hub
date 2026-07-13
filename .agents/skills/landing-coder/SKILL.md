---
name: landing-coder
description: >
  Write and edit code for apps/landing (marketing pages).
  Triggered when the user requests code related to landing pages,
  SEO, blog, or marketing content.
---

# Landing Coder

## Context to read
1. [RULES.md](../../context/Rules/General/RULES.md)
2. [OVERVIEW.md](../../context/Apps/landing/OVERVIEW.md)

## SEO Checklist (every page)
- [ ] Title tag (unique, < 60 chars)
- [ ] Meta description (< 160 chars)
- [ ] og:title, og:description, og:image
- [ ] Single h1, proper heading hierarchy
- [ ] next/image with alt text
- [ ] JSON-LD structured data (blog posts)

## Performance
- Static generation (SSG) for every page
- Images: WebP, lazy load
- Fonts: next/font
- Bundle size: keep minimal

## Checklist
- [ ] SEO metadata complete
- [ ] Lighthouse score > 90
- [ ] Mobile responsive
- [ ] Animations smooth (Framer Motion)
- [ ] Build pass: `pnpm --filter landing build`
