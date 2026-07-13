# Rule — Design system

## Colors (design tokens in `packages/ui/tokens`)
- Primary: `#2563EB` · Success: `#16A34A` · Warning: `#F59E0B` · Danger: `#DC2626`
- Background: `#F8FAFC` (light) — dark mode not yet supported, do not improvise

## Typography
- Font: Inter, fallback system-ui
- Scale: 12 / 14 (body) / 16 / 20 / 24 / 32 — do not use sizes outside the scale

## Spacing & layout
- 4px grid: every margin/padding is a multiple of 4
- Border radius: 8px (card, input), 999px (pill)
- Shadow: only use the token `shadow-sm` and `shadow-md`, do not write your own

## Principles
- Prefer existing components in `packages/ui`; if one is missing, propose adding it to ui — do not hand-roll it in the app
