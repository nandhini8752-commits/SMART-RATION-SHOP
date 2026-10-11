# Phase 1 — Foundation, App Shell, Database and API Baseline

Read the master prompt and all referenced specs. Inspect the existing repo; preserve working code.

Deliver:
- Responsive route shell and shared layout: PrototypeNotice, masthead using SRQMS mark, nav, breadcrumbs, accessible footer, locale selector.
- English/Tamil dictionary wiring and empty Telugu/Hindi dictionaries with clear fallback handling (do not leave untranslated key names on screen).
- Express API skeleton with `/api/v1/health`, `/api/v1/ready`, standard error middleware, request IDs, structured logging, request validation and CORS/security headers.
- PostgreSQL migrations and ORM models mapping `database/schema.sql`; implement a repeatable demo seed guarded by `DEMO_MODE=true`.
- `.env.example`, README setup instructions, lint/typecheck/test/build scripts, baseline unit tests.
- Seed demo shops, commodities, fake cards, counters and stock. Generate password hashes through the app seed script; do not put plaintext passwords or hashes into a public SQL file.

Do not implement all product screens yet. Verify a clean checkout can install, migrate, seed and run locally with no Gemini/Telegram keys. Report actual command output and blockers.
