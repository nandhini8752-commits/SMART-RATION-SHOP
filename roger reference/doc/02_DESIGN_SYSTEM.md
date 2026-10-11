# 02 — Government-Style Design System

## Design objective

Resemble the information architecture and visual restraint of Tamil Nadu government service portals while remaining clearly identified as an independent validation prototype. Reference official sites for terminology and structure; do not copy their entire stylesheet, claim endorsement, or fabricate a government logo.

## Visual direction

- **Mood:** formal, practical, public-service oriented, calm, high legibility.
- **Avoid:** startup gradients, glassmorphism, huge hero art, excessive rounded pills, decorative animations, dark-mode-first layouts, made-up statistics.
- **Layout:** narrow information banner; masthead with mark and department-style text; horizontal primary navigation; breadcrumb; page title; service content; public help/footer links.
- **Information density:** moderate. Tables and forms should feel like public service workflows, not marketing landing pages.

## Suggested design tokens

Use CSS variables/Tailwind theme tokens so the palette can be adjusted globally:

- `--tn-maroon: #7B2638` (primary action; check contrast with white before use on small text)
- `--tn-maroon-dark: #591A28` (hover / dark header)
- `--tn-cream: #F6F3EA` (masthead background)
- `--tn-gold: #C49A3A` (thin accent only, not body text)
- `--ink: #222222`
- `--muted-ink: #555555`
- `--page: #FFFFFF`
- `--surface: #F5F6F7`
- `--border: #D6D9DC`
- `--success: #1F6B45`, `--warning: #8A5300`, `--danger: #A12622`, `--info: #205A83`

Use the Tamil Nadu emblem only if the project's context and usage terms allow it; keep the prototype disclaimer adjacent. If uncertain, use `assets/logos/srqms-mark.svg` instead.

## Typography

- Tamil: `Noto Sans Tamil`, then system fallback. English: `Inter` or a system sans-serif.
- Body 16px minimum where practical; form labels 14–16px; line height 1.5–1.7, especially for Tamil.
- Avoid forcing uppercase in long English labels. Support 200% text zoom and avoid fixed-height translated text containers.

## Shared components

1. `PrototypeNotice`: persistent banner saying “Validation prototype — not an official government website. Uses sample data.”; localized.
2. `GovernmentStyleMasthead`: local project mark, Tamil/English title, language control and accessibility links. Do not display a fabricated official department seal.
3. `PrimaryNav` and mobile menu with active-link state.
4. `Breadcrumbs` and page title + short explanation.
5. `ServiceTile`: simple icon, title, description and ordinary text link.
6. `StatusBadge`: WAITING/SERVING/COMPLETED/CANCELLED/NO_SHOW labels translated through a dictionary.
7. `DataTable`: responsive table, semantic header, loading/empty/error states.
8. `FormField`: visible label, hint, error text and accessible `aria-describedby`.
9. `NoticeBanner`, `HelpContactBlock`, `ConfirmDialog`, `Pagination`, `LastUpdated`.
10. `DemoDataBadge`: identifies sample values and sample shop stock.

## Page patterns

- Citizen forms: one clear task per page, card-number example is explicitly labelled synthetic, no real PII fields.
- Operator desk: queue list on the left/top and active token/counter actions on right/bottom; large touch targets; no destructive action without confirmation.
- Inventory: quantity + unit always shown; separate “available” from “received”; ledger visible beside or below stock controls.
- Admin: filters and tables first, form in modal/dedicated route; audit logs read-only.
- Assistant: FAQ suggestions first, sources/official links visible and AI disclaimer where relevant.

## Accessibility requirements

- WCAG 2.2 AA target for contrast, keyboard operation, labels and focus.
- Minimum target size 24×24 CSS px (prefer 40–44px for primary touch interactions).
- Skip-to-content link, landmarks, meaningful headings, `aria-live="polite"` for queue status changes.
- Don't communicate statuses through color alone; always include text/icon.
- Respect `prefers-reduced-motion`; no animation required for critical state transitions.

## Motion and icons

Use Lucide React icons sparingly. Keep transitions 120–180ms and disable non-essential movement for reduced-motion. Queue refresh should not cause full-page flicker or move focus.
