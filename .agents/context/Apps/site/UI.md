# Site Design System

## Component Library
- Base: Shadcn/ui (Radix + Tailwind)
- Icons: Lucide React
- Fonts: Inter (Google Fonts)

## Color Tokens
- Primary: slate-900 (dark), white (light)
- Accent: blue-600
- Success: green-600
- Warning: amber-500
- Error: red-600
- Background: slate-50 (light), slate-950 (dark)

## Component Patterns
- Server Components by default
- Client Component only when: onClick, useState, useEffect
- Loading: Skeleton components
- Error: Error boundary + fallback UI
- Empty: Illustrated empty states

## Responsive
- Mobile first
- Breakpoints: sm(640) md(768) lg(1024) xl(1280)
- Grid: 1 col mobile → 2 col tablet → 3-4 col desktop

## Animation
- Transitions: 150ms ease
- Hover: scale(1.02) on cards
- Loading: pulse / skeleton
