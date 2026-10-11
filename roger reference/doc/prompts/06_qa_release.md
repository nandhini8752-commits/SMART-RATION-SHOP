# Phase 6 — Hardening, Accessibility, E2E and Handover

Use `09_ACCEPTANCE_TESTS.md` as the release checklist.

Tasks:
- Run unit, API integration, UI, end-to-end, lint, typecheck and production build. Add missing tests for the full citizen → staff → inventory flow.
- Test direct-loading of nested routes, 404, expired session, forbidden route, slow API, no network, empty lists, 500 errors, notification provider down and AI key absent.
- Check accessibility: keyboard-only flow, skip link, focus visibility, field labels, status announcements, contrast, reduced motion, zoom 200%, Tamil font wrapping and no horizontal overflow.
- Verify API validation, auth, shop scoping, rate limiting, CORS, CSP/security headers, idempotency, transactional stock ledger and secret/PII redaction in logs.
- Add seed/reset instructions that guard against production or non-demo databases. Include local demo credentials only in local-only docs and ensure no default password can survive production configuration.
- Create `docs/DEMO_SCRIPT.md`, `docs/KNOWN_LIMITATIONS.md`, `docs/ASSET_CREDITS.md`, updated root README and a requirement-to-test mapping.
- Ensure the app still works without Gemini/Telegram secrets and all optional integrations clearly degrade.

Do not announce launch readiness unless real tests ran. Provide a final concise implementation report: implemented features, test outcomes, commands, setup instructions, environment variables and unresolved risks.
