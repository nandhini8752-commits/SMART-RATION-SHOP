# Phase 2 — Citizen Portal

Implement routes from `03_PAGE_MAP.md` for home, shops, shop detail, ration-services guide, demo card verification, demo entitlement view, queue token creation/tracking/cancel, notices, complaints and help.

Requirements:
- Use APIs defined in `api/openapi.yaml`; create the corresponding API services, Zod schemas and integration tests.
- Synthetic card IDs only. Use `DEMO-TN-0001` through `DEMO-TN-0005` for local validation; display a clear sample-data label.
- Card verification creates a short-lived verification session; don't trust a card number provided directly by the browser for entitlement access or queue creation.
- Use an idempotency key to create a token; show current active token if a duplicate is attempted.
- Queue tracking polls at a configurable 3–5-second interval, stops when terminal status is reached, and announces changes accessibly without stealing focus.
- Entitlements come from versioned policy records, not hardcoded values; show source/effective date and demo/verified status prominently.
- Complaints are demo-only; generate non-guessable reference codes. Don't show complaint text to anyone who knows only the reference unless another verification factor is used.
- Local FAQ works without any provider key; official contact numbers and links are visibly identified as external official references and must be verified from the reference docs.
- Ensure all controls, filters and language toggles work on a 360px mobile screen and in Tamil.

Run API and UI tests including unknown card, duplicate token, cancellation, empty shops/notices and provider-offline paths.
